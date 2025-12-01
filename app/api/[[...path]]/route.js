/**
 * ============================================
 * THE SERVANTS - NGO PLATFORM API ROUTES
 * ============================================
 * Complete backend API for NGO platform
 * 
 * API Structure:
 * - /api/auth/* - Authentication endpoints
 * - /api/content/* - Content management
 * - /api/members/* - Member management
 * - /api/payments/* - Payment processing
 * - /api/gallery/* - Gallery management
 * - /api/initiatives/* - Initiatives management  
 * - /api/goals/* - Goals management
 * - /api/email/* - Email operations
 * - /api/upload - Cloudinary upload
 */

import { NextResponse } from 'next/server';
import { 
  UserModel, 
  MemberModel, 
  PaymentModel, 
  ContentModel, 
  GalleryModel, 
  InitiativeModel,
  GoalModel,
  EmailLogModel 
} from '@/lib/models';
import { generateToken, authenticate, hasRole } from '@/lib/auth';
import { 
  createOrder, 
  createSubscription, 
  createCustomer, 
  verifyPaymentSignature,
  MEMBERSHIP_PLANS,
  isRazorpayConfigured 
} from '@/lib/services/razorpay';
import { 
  uploadImage, 
  deleteImage, 
  isCloudinaryConfigured 
} from '@/lib/services/cloudinary';
import { 
  sendEmail, 
  sendNewsletter, 
  sendDonationReceipt, 
  sendWelcomeEmail 
} from '@/lib/services/email';

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

// Initialize default admin user
async function initializeAdmin() {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'theservants@admin.com';
    const existingAdmin = await UserModel.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      await UserModel.create({
        email: adminEmail,
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'servants786110',
        role: 'super_admin',
      });
      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// Initialize default content
async function initializeContent() {
  try {
    const aboutContent = await ContentModel.findByKey('about_us');
    if (!aboutContent) {
      await ContentModel.upsert('about_us', 
        'The Servants is a community-driven NGO dedicated to serving humanity with compassion and integrity. We believe in making a positive impact through education, healthcare, and community development.', 
        'text'
      );
      await ContentModel.upsert('hero_title', 'Serving Humanity with Compassion', 'text');
      await ContentModel.upsert('hero_subtitle', 'Join us in making a difference in the lives of those who need it most', 'text');
      console.log('✅ Default content created');
    }
  } catch (error) {
    console.error('Error initializing content:', error);
  }
}

// Call initialization on startup
initializeAdmin();
initializeContent();

/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 */

async function handleAuth(request, path) {
  // POST /api/auth/login
  if (path[1] === 'login' && request.method === 'POST') {
    try {
      const { email, password } = await request.json();
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const isValid = await UserModel.verifyPassword(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = generateToken(user);
      
      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // GET /api/auth/me
  if (path[1] === 'me' && request.method === 'GET') {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDetails = await UserModel.findById(user.id);
    return NextResponse.json({
      id: userDetails.id,
      email: userDetails.email,
      role: userDetails.role,
    });
  }

  // POST /api/auth/register (create new admin user)
  if (path[1] === 'register' && request.method === 'POST') {
    const user = authenticate(request);
    if (!user || !hasRole(user, ['super_admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
      const { email, password, role } = await request.json();
      
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const newUser = await UserModel.create({ email, password, role });
      
      return NextResponse.json({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * CONTENT MANAGEMENT ROUTES
 * ============================================
 */

async function handleContent(request, path) {
  // GET /api/content (get all content)
  if (request.method === 'GET' && path.length === 2) {
    try {
      const content = await ContentModel.findAll();
      const contentMap = {};
      content.forEach(item => {
        contentMap[item.key] = item.value;
      });
      return NextResponse.json(contentMap);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // GET /api/content/:key
  if (request.method === 'GET' && path[1]) {
    try {
      const content = await ContentModel.findByKey(path[1]);
      if (!content) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }
      return NextResponse.json(content);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // PUT /api/content/:key (update content - requires auth)
  if (request.method === 'PUT' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { value, type } = await request.json();
      const content = await ContentModel.upsert(path[1], value, type);
      return NextResponse.json(content);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * MEMBER MANAGEMENT ROUTES
 * ============================================
 */

async function handleMembers(request, path) {
  // GET /api/members (list all members - requires auth)
  if (request.method === 'GET' && path.length === 2) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const members = await MemberModel.findAll();
      return NextResponse.json(members);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/members (create member)
  if (request.method === 'POST' && path.length === 2) {
    try {
      const data = await request.json();
      const member = await MemberModel.create(data);
      
      // Send welcome email
      try {
        await sendWelcomeEmail(member);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      return NextResponse.json(member);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // GET /api/members/:id
  if (request.method === 'GET' && path[1]) {
    try {
      const member = await MemberModel.findById(path[1]);
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      return NextResponse.json(member);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // PUT /api/members/:id (update member - requires auth)
  if (request.method === 'PUT' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const data = await request.json();
      const member = await MemberModel.update(path[1], data);
      return NextResponse.json(member);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // DELETE /api/members/:id (requires auth)
  if (request.method === 'DELETE' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await MemberModel.delete(path[1]);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * PAYMENT ROUTES
 * ============================================
 */

async function handlePayments(request, path) {
  // GET /api/payments (list all payments - requires auth)
  if (request.method === 'GET' && path.length === 2) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const payments = await PaymentModel.findAll();
      return NextResponse.json(payments);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/payments/order (create payment order for one-time donation)
  if (path[1] === 'order' && request.method === 'POST') {
    try {
      const { amount, email, name } = await request.json();
      
      // Create Razorpay order
      const order = await createOrder(amount, 'INR', { email, name, type: 'donation' });
      
      // Save to database
      const payment = await PaymentModel.create({
        type: 'donation',
        amount,
        currency: 'INR',
        razorpayOrderId: order.id,
        status: 'created',
      });

      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        payment,
        isMocked: order.isMocked || false,
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/payments/subscription (create subscription for membership)
  if (path[1] === 'subscription' && request.method === 'POST') {
    try {
      const { memberId, membershipTier, email, name, phone } = await request.json();
      
      // Get plan details
      const plan = MEMBERSHIP_PLANS[membershipTier];
      if (!plan) {
        return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 });
      }

      // Create customer
      const customer = await createCustomer(name, email, phone);
      
      // Create subscription
      const subscription = await createSubscription(
        plan.id,
        customer.id,
        { memberId, membershipTier }
      );

      // Save to database
      const payment = await PaymentModel.create({
        type: 'subscription',
        amount: plan.amount,
        currency: plan.currency,
        memberId,
        razorpaySubscriptionId: subscription.id,
        status: 'created',
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        customerId: customer.id,
        payment,
        isMocked: subscription.isMocked || false,
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/payments/verify (verify payment)
  if (path[1] === 'verify' && request.method === 'POST') {
    try {
      const { orderId, paymentId, signature, email } = await request.json();
      
      // Verify signature
      const isValid = verifyPaymentSignature(orderId, paymentId, signature);
      
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }

      // Update payment status
      const payments = await PaymentModel.findAll();
      const payment = payments.find(p => p.razorpayOrderId === orderId);
      
      if (payment) {
        await PaymentModel.update(payment.id, {
          razorpayPaymentId: paymentId,
          status: 'paid',
          paidAt: new Date(),
        });

        // Send receipt email
        try {
          await sendDonationReceipt(email, payment);
        } catch (emailError) {
          console.error('Failed to send receipt:', emailError);
        }
      }

      return NextResponse.json({ success: true, payment });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/payments/webhook (Razorpay webhook)
  if (path[1] === 'webhook' && request.method === 'POST') {
    try {
      const payload = await request.json();
      
      // Handle different event types
      if (payload.event === 'payment.captured') {
        // Update payment status
        const paymentId = payload.payload.payment.entity.id;
        const orderId = payload.payload.payment.entity.order_id;
        
        const payments = await PaymentModel.findAll();
        const payment = payments.find(p => p.razorpayOrderId === orderId);
        
        if (payment) {
          await PaymentModel.update(payment.id, {
            razorpayPaymentId: paymentId,
            status: 'paid',
            paidAt: new Date(),
          });
        }
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // GET /api/payments/plans (get membership plans)
  if (path[1] === 'plans' && request.method === 'GET') {
    return NextResponse.json(MEMBERSHIP_PLANS);
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * GALLERY ROUTES
 * ============================================
 */

async function handleGallery(request, path) {
  // GET /api/gallery (list all images)
  if (request.method === 'GET' && path.length === 2) {
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      
      const images = await GalleryModel.findAll(category);
      return NextResponse.json(images);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/gallery (create image - requires auth)
  if (request.method === 'POST' && path.length === 2) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const data = await request.json();
      const image = await GalleryModel.create(data);
      return NextResponse.json(image);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // DELETE /api/gallery/:id (requires auth)
  if (request.method === 'DELETE' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await GalleryModel.delete(path[1]);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * INITIATIVES ROUTES
 * ============================================
 */

async function handleInitiatives(request, path) {
  // GET /api/initiatives (list all)
  if (request.method === 'GET' && path.length === 2) {
    try {
      const initiatives = await InitiativeModel.findAll();
      return NextResponse.json(initiatives);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/initiatives (create - requires auth)
  if (request.method === 'POST' && path.length === 2) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const data = await request.json();
      const initiative = await InitiativeModel.create(data);
      return NextResponse.json(initiative);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // PUT /api/initiatives/:id (update - requires auth)
  if (request.method === 'PUT' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const data = await request.json();
      const initiative = await InitiativeModel.update(path[1], data);
      return NextResponse.json(initiative);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // DELETE /api/initiatives/:id (requires auth)
  if (request.method === 'DELETE' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await InitiativeModel.delete(path[1]);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * GOALS ROUTES
 * ============================================
 */

async function handleGoals(request, path) {
  // GET /api/goals (list all)
  if (request.method === 'GET' && path.length === 2) {
    try {
      const goals = await GoalModel.findAll();
      return NextResponse.json(goals);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/goals (create - requires auth)
  if (request.method === 'POST' && path.length === 2) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const data = await request.json();
      const goal = await GoalModel.create(data);
      return NextResponse.json(goal);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // PUT /api/goals/:id (update - requires auth)
  if (request.method === 'PUT' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const data = await request.json();
      await GoalModel.update(path[1], data);
      const goal = await GoalModel.findAll();
      return NextResponse.json(goal);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // DELETE /api/goals/:id (requires auth)
  if (request.method === 'DELETE' && path[1]) {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await GoalModel.delete(path[1]);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * EMAIL ROUTES
 * ============================================
 */

async function handleEmail(request, path) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // POST /api/email/newsletter
  if (path[1] === 'newsletter' && request.method === 'POST') {
    try {
      const { subject, content } = await request.json();
      const result = await sendNewsletter(subject, content);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // POST /api/email/custom
  if (path[1] === 'custom' && request.method === 'POST') {
    try {
      const { to, subject, html } = await request.json();
      const result = await sendEmail({ to, subject, html });
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // GET /api/email/logs
  if (path[1] === 'logs' && request.method === 'GET') {
    try {
      const logs = await EmailLogModel.findAll();
      return NextResponse.json(logs);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * ============================================
 * UPLOAD ROUTE
 * ============================================
 */

async function handleUpload(request) {
  const user = authenticate(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method === 'POST') {
    try {
      const { image, folder } = await request.json();
      
      const result = await uploadImage(image, { folder });
      
      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
        isMocked: result.isMocked || false,
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

/**
 * ============================================
 * MAIN ROUTE HANDLER
 * ============================================
 */

export async function GET(request, { params }) {
  const path = params?.path || [];
  
  // Root route
  if (path.length === 0) {
    return NextResponse.json({ 
      message: 'The Servants NGO API', 
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth/*',
        content: '/api/content/*',
        members: '/api/members/*',
        payments: '/api/payments/*',
        gallery: '/api/gallery/*',
        initiatives: '/api/initiatives/*',
        goals: '/api/goals/*',
        email: '/api/email/*',
        upload: '/api/upload',
      }
    });
  }

  // Route to appropriate handler
  if (path[0] === 'auth') return handleAuth(request, path);
  if (path[0] === 'content') return handleContent(request, path);
  if (path[0] === 'members') return handleMembers(request, path);
  if (path[0] === 'payments') return handlePayments(request, path);
  if (path[0] === 'gallery') return handleGallery(request, path);
  if (path[0] === 'initiatives') return handleInitiatives(request, path);
  if (path[0] === 'goals') return handleGoals(request, path);
  if (path[0] === 'email') return handleEmail(request, path);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request, { params }) {
  const path = params?.path || [];

  if (path[0] === 'upload') return handleUpload(request);
  if (path[0] === 'auth') return handleAuth(request, path);
  if (path[0] === 'content') return handleContent(request, path);
  if (path[0] === 'members') return handleMembers(request, path);
  if (path[0] === 'payments') return handlePayments(request, path);
  if (path[0] === 'gallery') return handleGallery(request, path);
  if (path[0] === 'initiatives') return handleInitiatives(request, path);
  if (path[0] === 'goals') return handleGoals(request, path);
  if (path[0] === 'email') return handleEmail(request, path);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT(request, { params }) {
  const path = params?.path || [];

  if (path[0] === 'content') return handleContent(request, path);
  if (path[0] === 'members') return handleMembers(request, path);
  if (path[0] === 'initiatives') return handleInitiatives(request, path);
  if (path[0] === 'goals') return handleGoals(request, path);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(request, { params }) {
  const path = params?.path || [];

  if (path[0] === 'members') return handleMembers(request, path);
  if (path[0] === 'gallery') return handleGallery(request, path);
  if (path[0] === 'initiatives') return handleInitiatives(request, path);
  if (path[0] === 'goals') return handleGoals(request, path);

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

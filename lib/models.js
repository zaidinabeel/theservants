/**
 * ============================================
 * DATABASE MODELS & SCHEMAS
 * ============================================
 * Defines all database collections and their structures
 */

import { getCollection } from './db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Collection Names
 */
export const COLLECTIONS = {
  USERS: 'users',
  MEMBERS: 'members',
  PAYMENTS: 'payments',
  CONTENT: 'content',
  GALLERY: 'gallery',
  INITIATIVES: 'initiatives',
  GOALS: 'goals',
  CSR: 'csr_activities',
  EMAIL_LOGS: 'email_logs',
};

/**
 * ============================================
 * USER MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   email: string
 *   password: string (hashed)
 *   role: 'super_admin' | 'staff_admin'
 *   createdAt: Date
 * }
 */
export class UserModel {
  static async create({ email, password, role = 'staff_admin' }) {
    const collection = await getCollection(COLLECTIONS.USERS);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };
    
    await collection.insertOne(user);
    return user;
  }

  static async findByEmail(email) {
    const collection = await getCollection(COLLECTIONS.USERS);
    return await collection.findOne({ email });
  }

  static async findById(id) {
    const collection = await getCollection(COLLECTIONS.USERS);
    return await collection.findOne({ id });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

/**
 * ============================================
 * MEMBER MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   name: string
 *   email: string
 *   phone: string
 *   membershipTier: 'basic' | 'core' | 'premium'
 *   status: 'pending' | 'approved' | 'rejected'
 *   paymentStatus: 'active' | 'inactive' | 'pending'
 *   subscriptionId: string (Razorpay)
 *   createdAt: Date
 *   approvedAt: Date
 * }
 */
export class MemberModel {
  static async create(data) {
    const collection = await getCollection(COLLECTIONS.MEMBERS);
    
    const member = {
      id: uuidv4(),
      ...data,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
    };
    
    await collection.insertOne(member);
    return member;
  }

  static async findAll() {
    const collection = await getCollection(COLLECTIONS.MEMBERS);
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async findById(id) {
    const collection = await getCollection(COLLECTIONS.MEMBERS);
    return await collection.findOne({ id });
  }

  static async update(id, data) {
    const collection = await getCollection(COLLECTIONS.MEMBERS);
    await collection.updateOne({ id }, { $set: { ...data, updatedAt: new Date() } });
    return await this.findById(id);
  }

  static async delete(id) {
    const collection = await getCollection(COLLECTIONS.MEMBERS);
    await collection.deleteOne({ id });
  }
}

/**
 * ============================================
 * PAYMENT MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   type: 'donation' | 'subscription'
 *   amount: number
 *   currency: string
 *   memberId: string (optional)
 *   razorpayOrderId: string
 *   razorpayPaymentId: string
 *   razorpaySubscriptionId: string
 *   status: 'created' | 'paid' | 'failed'
 *   createdAt: Date
 *   paidAt: Date
 * }
 */
export class PaymentModel {
  static async create(data) {
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    
    const payment = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };
    
    await collection.insertOne(payment);
    return payment;
  }

  static async findAll() {
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async findById(id) {
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    return await collection.findOne({ id });
  }

  static async update(id, data) {
    const collection = await getCollection(COLLECTIONS.PAYMENTS);
    await collection.updateOne({ id }, { $set: { ...data, updatedAt: new Date() } });
    return await this.findById(id);
  }
}

/**
 * ============================================
 * CONTENT MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   key: string (unique identifier like 'about_us', 'hero_title')
 *   value: string | object
 *   type: 'text' | 'html' | 'json'
 *   updatedAt: Date
 * }
 */
export class ContentModel {
  static async upsert(key, value, type = 'text') {
    const collection = await getCollection(COLLECTIONS.CONTENT);
    
    const content = {
      id: uuidv4(),
      key,
      value,
      type,
      updatedAt: new Date(),
    };
    
    await collection.updateOne(
      { key },
      { $set: content },
      { upsert: true }
    );
    
    return content;
  }

  static async findByKey(key) {
    const collection = await getCollection(COLLECTIONS.CONTENT);
    return await collection.findOne({ key });
  }

  static async findAll() {
    const collection = await getCollection(COLLECTIONS.CONTENT);
    return await collection.find({}).toArray();
  }
}

/**
 * ============================================
 * GALLERY MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   title: string
 *   description: string
 *   imageUrl: string (Cloudinary URL)
 *   category: 'initiative' | 'csr' | 'general'
 *   createdAt: Date
 * }
 */
export class GalleryModel {
  static async create(data) {
    const collection = await getCollection(COLLECTIONS.GALLERY);
    
    const image = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };
    
    await collection.insertOne(image);
    return image;
  }

  static async findAll(category = null) {
    const collection = await getCollection(COLLECTIONS.GALLERY);
    const query = category ? { category } : {};
    return await collection.find(query).sort({ createdAt: -1 }).toArray();
  }

  static async delete(id) {
    const collection = await getCollection(COLLECTIONS.GALLERY);
    await collection.deleteOne({ id });
  }
}

/**
 * ============================================
 * INITIATIVES MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   title: string
 *   description: string
 *   imageUrl: string (Cloudinary URL)
 *   date: Date
 *   location: string
 *   createdAt: Date
 * }
 */
export class InitiativeModel {
  static async create(data) {
    const collection = await getCollection(COLLECTIONS.INITIATIVES);
    
    const initiative = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };
    
    await collection.insertOne(initiative);
    return initiative;
  }

  static async findAll() {
    const collection = await getCollection(COLLECTIONS.INITIATIVES);
    return await collection.find({}).sort({ date: -1 }).toArray();
  }

  static async findById(id) {
    const collection = await getCollection(COLLECTIONS.INITIATIVES);
    return await collection.findOne({ id });
  }

  static async update(id, data) {
    const collection = await getCollection(COLLECTIONS.INITIATIVES);
    await collection.updateOne({ id }, { $set: { ...data, updatedAt: new Date() } });
    return await this.findById(id);
  }

  static async delete(id) {
    const collection = await getCollection(COLLECTIONS.INITIATIVES);
    await collection.deleteOne({ id });
  }
}

/**
 * ============================================
 * GOALS MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   title: string
 *   description: string
 *   icon: string
 *   order: number
 *   createdAt: Date
 * }
 */
export class GoalModel {
  static async create(data) {
    const collection = await getCollection(COLLECTIONS.GOALS);
    
    const goal = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };
    
    await collection.insertOne(goal);
    return goal;
  }

  static async findAll() {
    const collection = await getCollection(COLLECTIONS.GOALS);
    return await collection.find({}).sort({ order: 1 }).toArray();
  }

  static async update(id, data) {
    const collection = await getCollection(COLLECTIONS.GOALS);
    await collection.updateOne({ id }, { $set: { ...data, updatedAt: new Date() } });
  }

  static async delete(id) {
    const collection = await getCollection(COLLECTIONS.GOALS);
    await collection.deleteOne({ id });
  }
}

/**
 * ============================================
 * EMAIL LOG MODEL
 * ============================================
 * Schema: {
 *   id: string (UUID)
 *   type: 'newsletter' | 'monthly' | 'receipt' | 'custom'
 *   to: string | string[]
 *   subject: string
 *   status: 'sent' | 'failed'
 *   error: string
 *   sentAt: Date
 * }
 */
export class EmailLogModel {
  static async create(data) {
    const collection = await getCollection(COLLECTIONS.EMAIL_LOGS);
    
    const log = {
      id: uuidv4(),
      ...data,
      sentAt: new Date(),
    };
    
    await collection.insertOne(log);
    return log;
  }

  static async findAll(limit = 100) {
    const collection = await getCollection(COLLECTIONS.EMAIL_LOGS);
    return await collection.find({}).sort({ sentAt: -1 }).limit(limit).toArray();
  }
}

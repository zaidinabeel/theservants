'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InitiativeModal({ initiative, open, onClose }) {
  if (!initiative) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl text-deep-blue pr-8">{initiative.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Initiative Image */}
          {initiative.imageUrl && (
            <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <img 
                src={initiative.imageUrl} 
                alt={initiative.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Date and Location */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
            {initiative.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold" />
                <span>{new Date(initiative.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            )}
            {initiative.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" />
                <span>{initiative.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose max-w-none">
            <p className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {initiative.description}
            </p>
          </div>

          {/* Additional Details if available */}
          {initiative.details && (
            <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-deep-blue mb-3">Additional Details</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{initiative.details}</p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="bg-deep-blue text-white hover:bg-deep-blue/90">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, Tag } from "lucide-react";

interface CalendarEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  description: string;
  createdById: string;
}

interface ViewEventsModalProps {
  open: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  selectedDate: string;
}

export function ViewEventsModal({ open, onClose, events, selectedDate }: ViewEventsModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'deadline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return '👥';
      case 'deadline':
        return '⏰';
      case 'reminder':
        return '🔔';
      default:
        return '📅';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events for {formatDate(selectedDate)}
          </DialogTitle>
          <DialogDescription>
            {events.length === 0 
              ? "No events scheduled for this date." 
              : `${events.length} event${events.length > 1 ? 's' : ''} scheduled for this date.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events scheduled for this date.</p>
              <p className="text-sm">Click "Add Event" to create a new event.</p>
            </div>
          ) : (
            events
              .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
              .map((event) => (
                <Card key={event.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                        {event.name}
                      </CardTitle>
                      <Badge className={getEventTypeColor(event.type)}>
                        <Tag className="h-3 w-3 mr-1" />
                        {event.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      {event.description && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">Description:</p>
                            <p className="text-foreground">{event.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
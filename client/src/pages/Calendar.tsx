import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AddEventModal } from "@/components/modals/AddEventModal";
import { ViewEventsModal } from "@/components/modals/ViewEventsModal";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface CalendarEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  description: string;
  createdById: string;
}

interface CalendarDay {
  day: number;
  current: boolean;
  events: CalendarEvent[];
}

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showViewEventsModal, setShowViewEventsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const { toast } = useToast();
  const { user, isLoading } = useUser();
  
  const fetchEvents = async () => {
    if (!user?.id) return;
    
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/events`, { 
        headers,
        params: { userId: user.id }
      });
      
      // Group events by date
      const eventsByDate: { [key: string]: CalendarEvent[] } = {};
      response.data.forEach((event: CalendarEvent) => {
        const dateKey = event.date.split('T')[0]; // Extract date part from ISO string
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
      });
      
      setEvents(eventsByDate);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };
  
  useEffect(() => {
    if (!isLoading && user?.id) {
      fetchEvents();
    }
  }, [currentMonth, user?.id, isLoading]);
  
  // Function to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const daysArray: CalendarDay[] = Array.from({length: firstDay}, (_, i) => ({
      day: new Date(year, month, -i).getDate(),
      current: false,
      events: []
    }));
    
    for (let i = 1; i <= days; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      daysArray.push({
        day: i,
        current: true,
        events: events[dateKey] || []
      });
    }
    
    return daysArray;
  };
  
  const handleAddEvent = async (eventDetails: {
    name: string;
    type: string;
    date: string;
    time: string;
    description: string;
  }) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add events.",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Convert date to ISO string format
      const eventPayload = {
        ...eventDetails,
        date: new Date(eventDetails.date).toISOString(),
      };
      
      await axios.post(`${API_URL}/events`, eventPayload, { headers });
      
      // Refresh events after successful creation
      await fetchEvents();
      
      toast({
        title: "Event Added",
        description: `${eventDetails.name} has been added to your calendar.`,
      });
    } catch (error) {
      console.error('Failed to add event:', error);
      toast({
        title: "Error",
        description: "Failed to add event.",
        variant: "destructive"
      });
    }
  };
  
  const days = getDaysInMonth(currentMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: CalendarDay) => {
    if (!day.current) return; // Don't handle clicks on previous/next month days
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    
    setSelectedDate(dateKey);
    setSelectedDateEvents(day.events);
    setShowViewEventsModal(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Loading your calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Please log in to view your calendar.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage events, deadlines, and meetings</p>
        </div>
        <Button onClick={() => setShowAddEventModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Manage your schedule and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <div key={day} className="text-center font-medium p-2 text-sm">
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <div 
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  p-2 min-h-[100px] border text-sm transition-colors
                  ${day.current ? 'bg-background hover:bg-muted/50 cursor-pointer' : 'bg-muted/30 text-muted-foreground'}
                  ${new Date().getDate() === day.day && 
                    new Date().getMonth() === currentMonth.getMonth() && 
                    new Date().getFullYear() === currentMonth.getFullYear() && 
                    day.current ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div className="font-medium">{day.day}</div>
                {day.events.map((event, i) => (
                  <div 
                    key={i} 
                    className={`
                      mt-1 p-1 text-xs rounded truncate
                      ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                      ${event.type === 'deadline' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                      ${event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                    `}
                    title={`${event.name} - ${event.time}${event.description ? ` - ${event.description}` : ''}`}
                  >
                    {event.name} - {event.time}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddEventModal 
        open={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onAdd={handleAddEvent}
      />

      <ViewEventsModal
        open={showViewEventsModal}
        onClose={() => setShowViewEventsModal(false)}
        events={selectedDateEvents}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;

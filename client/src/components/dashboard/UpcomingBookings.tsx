import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, X, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export interface Booking {
  id: string;
  service: string;
  customer: string;
  time: Date;
}

interface UpcomingBookingsProps {
  bookings: Booking[];
}

const UpcomingBookings = ({ bookings }: UpcomingBookingsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Upcoming Bookings</CardTitle>
          <Link href="/bookings">
            <Button variant="link" className="text-sm font-medium text-primary hover:text-primary">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <h4 className="text-sm font-medium text-gray-900">
                      {booking.service}
                    </h4>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{booking.customer}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>
                      <time dateTime={booking.time.toISOString()}>
                        {format(booking.time, "PPP 'at' p")}
                      </time>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="icon" variant="default" className="h-8 w-8 rounded-full">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cancel</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {bookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any bookings scheduled.
              </p>
              <div className="mt-6">
                <Link href="/bookings">
                  <Button>Create a new booking</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingBookings;

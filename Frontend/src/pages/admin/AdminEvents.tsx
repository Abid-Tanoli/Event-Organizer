import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { eventsAPI } from "../../api/events";
import { format } from "date-fns";

export default function AdminEvents() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-events", statusFilter],
    queryFn: () =>
      eventsAPI.getAllEvents({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const handleApprove = async (eventId: string) => {
    await eventsAPI.updateStatus(eventId, { status: "approved" });
    refetch();
  };

  const handleReject = async (eventId: string) => {
    await eventsAPI.updateStatus(eventId, { status: "rejected" });
    refetch();
  };

  const events = data?.data?.data?.events || [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events Management</h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Event</th>
                <th className="p-4 text-left">Organizer</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Seats</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event: any) => (
                <tr key={event._id} className="border-t">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={event.image}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.city}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    {event.organizer?.organizationName || "N/A"}
                  </td>

                  <td className="p-4">
                    {format(new Date(event.date), "MMM dd, yyyy")}
                  </td>

                  <td className="p-4">{event.status}</td>

                  <td className="p-4">
                    {event.soldTickets} / {event.totalSeats}
                  </td>

                  <td className="p-4 flex gap-2">
                    <EyeIcon className="h-5 w-5 cursor-pointer" />

                    {event.status === "pending" && (
                      <>
                        <CheckCircleIcon
                          onClick={() => handleApprove(event._id)}
                          className="h-5 w-5 text-green-600 cursor-pointer"
                        />
                        <XCircleIcon
                          onClick={() => handleReject(event._id)}
                          className="h-5 w-5 text-red-600 cursor-pointer"
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

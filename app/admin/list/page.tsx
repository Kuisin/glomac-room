"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faPenToSquare,
  faTrashCan,
  fas,
} from "@fortawesome/free-solid-svg-icons";
library.add(fas);

interface ForceRecord {
  id: number;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  description: string | null;
  roomId: number;
  userId: number | null;
  status: string;
  type: string;
  room?: {
    name: string;
  };
  user?: {
    displayName: string;
  };
}

export default function ListPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ForceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ForceRecord>>({});
  const [popup, setPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<ForceRecord | null>(
    null
  );
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchRecords();
    fetchRooms();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/force-records");
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();
      // Filter records to only include today and future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filteredRecords = data.filter(
        (record: ForceRecord) => new Date(record.startTime) >= today
      );
      // Sort records by startTime in ascending order
      const sortedRecords = filteredRecords.sort(
        (a: ForceRecord, b: ForceRecord) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      setRecords(sortedRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/getOpenByPeriods?facilityId=1");
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      if (data.ok) {
        setRooms(data.rooms);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (record: ForceRecord) => {
    setSelectedRecord(record);
    setEditForm({
      title: record.title,
      startTime: record.startTime,
      endTime: record.endTime,
      description: record.description,
      roomId: record.roomId,
    });
    setPopup(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`/api/force-records/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete record");
      setRecords(records.filter((record) => record.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [id]: id === "startTime" || id === "endTime" ? value : value,
    }));
  };

  const validateForm = () => {
    if (!editForm.title?.trim()) {
      setPopupMessage("Title is required");
      return false;
    }
    if (!editForm.roomId) {
      setPopupMessage("Room is required");
      return false;
    }
    if (!editForm.startTime || !editForm.endTime) {
      setPopupMessage("Start time and end time are required");
      return false;
    }
    const start = new Date(editForm.startTime as string);
    const end = new Date(editForm.endTime as string);
    if (start >= end) {
      setPopupMessage("End time must be after start time");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!selectedRecord) return;
    setPopupMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      const url =
        selectedRecord.id === 0
          ? "/api/force-records"
          : `/api/force-records/${selectedRecord.id}`;

      const method = selectedRecord.id === 0 ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editForm,
          startTime: new Date(editForm.startTime as string).toISOString(),
          endTime: new Date(editForm.endTime as string).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update record");
      }

      await fetchRecords();
      setPopup(false);
      setSelectedRecord(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const date = format(new Date(record.startTime), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, ForceRecord[]>);

  // Sort dates in ascending order (most recent at top)
  const sortedDates = Object.keys(groupedRecords).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
        <div className="px-4 flex flex-col">
          <button
            onClick={() => {
              setSelectedRecord({
                id: 0,
                title: "",
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
                description: "",
                roomId: 0,
                userId: null,
                status: "CONFIRMED",
                type: "FORCE",
              });
              setEditForm({
                title: "",
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
                description: "",
                roomId: 0,
              });
              setPopup(true);
            }}
            className="ml-auto my-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add New Schedule
          </button>
          <div className="rounded overflow-x-auto">
            <table className="w-full divide-y divide-gray-400 table-fixed">
              <thead className="bg-gray-400 text-white">
                <tr className="*:px-4 *:py-3 *:text-left *:whitespace-nowrap">
                  <th className="w-1/3">Title</th>
                  <th>Room</th>
                  <th>User</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  {/* <th>Description</th> */}
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDates.map((date) => (
                  <React.Fragment key={date}>
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-1 bg-gray-100 whitespace-nowrap"
                      >
                        {date}
                      </td>
                    </tr>
                    {groupedRecords[date].map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 truncate max-w-[200px]">
                          {record.title}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.room?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.user?.displayName || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {format(new Date(record.startTime), "HH:mm")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {format(new Date(record.endTime), "HH:mm")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {popup && selectedRecord && (
            <div className="z-50 px-15 py-auto">
              <div
                id="default-modal"
                className="fixed inset-0 z-50 flex justify-center items-center py-5"
              >
                <form className="relative p-4 w-full max-w-2xl h-full">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-h-full overflow-hidden flex flex-col">
                    <div className="relative p-5 overflow-y-scroll">
                      <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="title"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            value={editForm.title || ""}
                            onChange={handleValueChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Title of Schedule"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="roomId"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Room
                          </label>
                          <select
                            id="roomId"
                            value={editForm.roomId || 0}
                            onChange={handleValueChange}
                            disabled={selectedRecord.id !== 0}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                          >
                            <option value={0}>Select a room</option>
                            {rooms.map((room) => (
                              <option key={room.id} value={room.id}>
                                {room.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="startTime"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Start Time
                          </label>
                          <input
                            type="datetime-local"
                            id="startTime"
                            value={format(
                              new Date(editForm.startTime as Date),
                              "yyyy-MM-dd'T'HH:mm"
                            )}
                            onChange={handleValueChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="endTime"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            End Time
                          </label>
                          <input
                            type="datetime-local"
                            id="endTime"
                            value={format(
                              new Date(editForm.endTime as Date),
                              "yyyy-MM-dd'T'HH:mm"
                            )}
                            onChange={handleValueChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="description"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Description
                          </label>
                          <input
                            type="text"
                            id="description"
                            value={editForm.description || ""}
                            onChange={handleValueChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Description of Schedule"
                          />
                        </div>
                      </div>
                      {popupMessage !== "" && (
                        <a className="text-red-500">{`Empty Field(s): ${popupMessage}`}</a>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                      <button
                        type="button"
                        className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        onClick={() => {
                          setPopup(false);
                          setPopupMessage("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={handleUpdate}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="fixed inset-0 z-40 width-vw height-vh bg-black/50"></div>
            </div>
          )}
        </div>
  );
}

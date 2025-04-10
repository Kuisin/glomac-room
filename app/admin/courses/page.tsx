"use client";
import { addDays, format } from "date-fns";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import Papa from "papaparse";

import { toTimeInputValue } from "@/utils/dataConverter";

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
import { toJapanTimestamp } from "@/utils/timestampUtils";
library.add(fas);

interface CsvData {
  [key: string]: any;
}

const convertDays = {
  月: 1, // Monday
  火: 2, // Tuesday
  水: 3, // Wednesday
  木: 4, // Thursday
  金: 5, // Friday
  土: 6, // Saturday
  日: 0, // Sunday
};

type HeaderMap = { [key: string]: string };
type HeaderMapList = { [key: string]: string[] };
const expectedHeaders: HeaderMapList = {
  title: ["Title: 授業名／予約名", "漢字科目名"],
  room: ["Room: 教室番号（F000）", "部屋番号"],
  day: ["Day: 実施曜日（月、火、水、木、金、土、日）", "曜日名称"],
  startTime: ["Start Time: 開始時間（HH:mm）", "開始時間"],
  endTime: ["End Time: 終了時間（HH:mm）", "終了時間"],
  // type: ["Type: 予約種類", ""],
  // user: ["User: 予約者", ""],
};

const checkValid = (data: CsvData) => {
  let message = [];
  if (!data.title || data.title === "") message.push("Title");
  // if (!data.type || data.type === '') message.push('Type');
  if (!data.room || data.room === "") message.push("Room");
  if (!data.startTime || data.startTime === "") message.push("Start Time");
  if (!data.endTime || data.endTime === "") message.push("End Time");
  if (!data.date || data.date === "") message.push("Date");
  //   if (!data.endOfRepeat || data.endOfRepeat === "")
  //     message.push("End of Repeat");

//   console.log("message", message);
  if (message.length === 0) return { success: true, message };

  console.log("message", data);
  return { success: false, message };
};

export default function CourseDataUpload() {
  const router = useRouter();

  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [showHeaderMapDialog, setShowHeaderMapDialog] = useState(false);
  const [headerMap, setHeaderMap] = useState<HeaderMap>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [startOfRepeat, setStartOfRepeat] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [endOfRepeat, setEndOfRepeat] = useState<string>("");

  const [selectedData, setSelectedData] = useState<CsvData | null>(null);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [popup, setPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      Papa.parse<CsvData>(file, {
        header: true,
        complete: (result: any) => {
          const headers = result.meta.fields;
          setCsvHeaders(headers);

          // Auto-map headers if they match expected headers
          const autoMap: { [key: string]: string } = {};
          headers.forEach((header: string) => {
            // Check if header matches any expected header
            Object.entries(expectedHeaders).forEach(([key, value]) => {
              if (value[1] === header) {
                autoMap[key] = header;
              }
            });
          });

          setHeaderMap(autoMap);
          setShowHeaderMapDialog(true);
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  const mapHeaders = (row: CsvData, headerMap: HeaderMap): CsvData => {
    const mappedRow: CsvData = {};
    for (const key in headerMap) {
      if (row[headerMap[key]] !== undefined) {
        mappedRow[key] = row[headerMap[key]];
      } else {
        mappedRow[key] = "";
      }
    }
    return mappedRow;
  };
  const handleHeaderMapConfirm = () => {
    if (uploadedFile) {
      Papa.parse<CsvData>(uploadedFile, {
        header: true,
        complete: (result: any) => {
          const parsedData = result.data
            .map((row: CsvData, index: number) => {
              const mappedRow = mapHeaders(row, headerMap);
            //   const result = checkValid(mappedRow);

              try {
                const startTime = toTimeInputValue(mappedRow.startTime);
                const endTime = toTimeInputValue(mappedRow.endTime);
                // const day = convertTimestampAdv(`${mappedRow.day} 00:00:00`);

                const firstDate = new Date(startOfRepeat);
                const targetDay =
                  convertDays[mappedRow.day as keyof typeof convertDays];
                const daysToAdd = (targetDay - firstDate.getDay() + 7) % 7;
                firstDate.setDate(firstDate.getDate() + daysToAdd);
                console.log("new row:", firstDate, targetDay, firstDate);

                return {
                  ...mappedRow,
                  startTime,
                  endTime,
                  date: format(firstDate, "yyyy-MM-dd"),
                  endOfRepeat: format(endOfRepeat, "yyyy-MM-dd"),
                  selected: false,
                  error: false,
                  message: [],
                };
              } catch (err) {
                console.log("skip row: ", err);
                setError(error + `[Skip Row: ${index}]`);
                return null;
              }
            })
            .filter((row: CsvData | null) => row !== null);
          setCsvData(parsedData);
          setShowHeaderMapDialog(false);

          console.log("parsedData", parsedData);
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setError("Creating Upload Data...");
    console.log("start upload");

    try {
      const repeatedData = repeatSchedules(csvData);
      console.log("repeatedData", repeatedData);

      if (repeatedData.some((item) => item.error)) {
        setError("Some Fields are Empty");
        console.log("error", csvData);
        setIsUploading(false);
        return;
      }
      setError("");
      console.log("uploadData", repeatedData);

      const uploadBatch = async (batch: object) => {
        const response = await fetch("/api/uploadCsv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: batch,
            info: {
              type: "COURSE",
              universityId: 1,
              facilityId: 1,
            },
          }),
        });
        console.log("response", response);

        if (!response.ok) {
          throw new Error("Failed to upload data");
        }
      };

      setError("Uploading to Server. This may take a while...");
    
      const response = await fetch("/api/deleteCourseData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          info: {
            type: "COURSE",
            universityId: 1,
            facilityId: 1,
          },
        }),
      });
      console.log("response", response);

      if (!response.ok) {
        throw new Error("Failed to upload data");
      }

      const chunkSize = 200;
      for (let i = 0; i < repeatedData.length; i += chunkSize) {
        console.log(`start batch: ${i}-${i + chunkSize}`);
        setError(
          `Uploading to Server... [${i}-${Math.min(i + chunkSize, repeatedData.length)}/${
            repeatedData.length
          }]`
        );
        const chunk = repeatedData.slice(i, i + chunkSize);
        await uploadBatch(chunk);
        console.log("batch completed");
      }

      window.alert("Data upload successful! Reloading the page...");
      window.location.reload();
    } catch (err) {
      setError("Unknown Error: " + err);
      console.error("Error uploading data:", err);
    }
  };

  type UploadData = {
    title: string;
    type: string | null;
    room: string;
    startTime: Date;
    endTime: Date;
    user: string | null;
    error: boolean;
    message: string[];
  };
  const repeatSchedules = (data: CsvData[]): UploadData[] => {
    const repeatedData: UploadData[] = [];
    data.forEach((row) => {
    //   const startOfRepeatDate = new Date(row.date);
      const endOfRepeatDate = new Date(row.endOfRepeat);

    //   const startDate = new Date(row.date + " " + row.startTime);
    //   const endDate = new Date(row.date + " " + row.endTime);
      const startDate = toJapanTimestamp(row.date, row.startTime);
      const endDate = toJapanTimestamp(row.date, row.endTime);

      const result = checkValid(row);

      for (
        let date = startDate;
        date <= endOfRepeatDate;
        date = addDays(date, 7)
      ) {
        const newStartTime = new Date(date);
        const newEndTime = new Date(date);
        newEndTime.setHours(endDate.getHours());
        newEndTime.setMinutes(endDate.getMinutes());

        repeatedData.push({
          title: row.title?.trim() || "Unkown Schedule",
          type: row.type?.trim() || null,
          room: row.room?.trim() || "",
          startTime: newStartTime,
          endTime: newEndTime,
          user: row.user?.trim() || null,
          error: !result.success,
          message: result.message,
        });
      }
    });
    return repeatedData;
  };

  const handleHeaderMapChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    expectedHeader: string
  ) => {
    setHeaderMap((prevState) => ({
      ...prevState,
      [expectedHeader]: event.target.value,
    }));
  };

  const handleCheckboxChange = (rowIndex: number, isChecked: boolean) => {
    const updatedData = csvData.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, selected: isChecked };
      }
      return row;
    });
    setCsvData(updatedData);
  };

  const handleCheckboxChangeAll = () => {
    const newSelectAll = !selectAll;
    const updatedData = csvData.map((row) => {
      return { ...row, selected: newSelectAll };
    });
    setSelectAll(newSelectAll);
    setCsvData(updatedData);
  };

  const editData = (index: number) => {
    console.log("editData", csvData[index]);
    setSelectedData({ ...csvData[index], index });
    setPopup(true);
  };

  const removeData = (index: number) => {
    const newData = csvData.filter((_, i) => i !== index);
    setCsvData(newData);
  };

  const removeDataMulti = () => {
    const newData = csvData.filter((row) => !row.selected);
    setCsvData(newData);
  };

  const addData = () => {
    setSelectedData({
      selected: false,
      index: csvData.length,
      title: "",
      room: "",
      date: "",
      startTime: "",
      endTime: "",
      endOfRepeat: "",
      type: "",
      user: "",
    });
    setPopup(true);
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSelectedData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const updateData = () => {
    if (selectedData) {
      const result = checkValid(selectedData);
      if (result.success) {
        const editItem = selectedData;
        const rowIndex = editItem.index as number;
        delete editItem.index;

        let updatedData = csvData;
        updatedData[rowIndex] = editItem;
        setCsvData(updatedData);

        console.log(editItem);
        setError("");
        setPopup(false);
      } else {
        setPopupMessage(result.message.join(", "));
        setError("Some Fields are Empty");
      }
    }
  };

  return (
    <div id="app" className="flex flex-col h-screen bg-white text-black">
      <header className="sticky top-0 left-0 z-40 w-full flex items-center justify-between bg-white px-4 py-4 shadow">
        <h1 className="font-bold">
          Forest Gateway 空き教室（繰り返し予定の登録）
        </h1>
        <button
          className="cursor-pointer bg-gray-200 hover:bg-white text-gray-800 px-4 py-2 rounded shadow"
          onClick={() => {
            router.push("/admin");
          }}
        >
          HOME
        </button>
      </header>
      <div className="p-4">
        <div className="mb-4">
          <label
            className="block mb-2 text-normal font-medium text-gray-900 dark:text-white"
            htmlFor="file_input"
          >
            Upload file (CSV):　　200 件/分（繰返分を含む）
          </label>
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          <p
            id="file_input_help"
            className="mt-1 text-sm text-gray-500 dark:text-gray-300"
          >
            Required Fields: Title, Type, Start Time, End Time, Room (Optional:
            User, Description)
          </p>
        </div>
        {showHeaderMapDialog && (
          <div className="z-50 px-15 py-auto">
            <div
              id="header-map-modal"
              className="fixed inset-0 z-50 flex justify-center items-center py-5"
            >
              <div className="relative p-4 w-full max-w-2xl h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-h-full overflow-hidden flex flex-col">
                  <div className="relative p-5 overflow-y-scroll">
                    <h3 className="mb-2 text-lg text-green-600 font-medium dark:text-white">
                      Set Start Date of Repeat
                    </h3>
                    <input
                      type="date"
                      id="day"
                      value={startOfRepeat}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => setStartOfRepeat(e.target.value)}
                      className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <div className="mt-2 mb-4 text-sm text-gray-500">Use date after today.</div>
                    <h3 className="mb-2 text-lg text-red-600 font-medium dark:text-white">
                      Set End Date of Repeat
                    </h3>
                    <input
                      type="date"
                      id="endOfRepeat"
                      value={endOfRepeat}
                      onChange={(e) => setEndOfRepeat(e.target.value)}
                      className="mb-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                      Map CSV Headers
                    </h3>
                    <div className="grid gap-6">
                      {Object.keys(expectedHeaders).map((expectedHeader) => (
                        <div key={expectedHeader}>
                          <label
                            htmlFor={expectedHeader}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {expectedHeaders[expectedHeader][0]}
                          </label>
                          <select
                            id={expectedHeader}
                            value={headerMap[expectedHeader] || ""}
                            onChange={(e) =>
                              handleHeaderMapChange(e, expectedHeader)
                            }
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option value="">Select Header</option>
                            {csvHeaders.map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                    <button
                      type="button"
                      className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                      onClick={() => setShowHeaderMapDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={handleHeaderMapConfirm}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black/50"></div>
          </div>
        )}
        {csvData.length > 0 && (
          <>
            <div className="border-b border-gray-300 my-6"></div>
            <div>
              <div className="flex col-row justify-between">
                <h3 className="mb-2">CSV Data:</h3>
                <div className="flex gap-2">
                  <a
                    className={`${
                      !csvData.some((item) => item.selected) && "hidden"
                    } text-red-600 hover:text-red-500 underline`}
                    onClick={removeDataMulti}
                  >
                    Remove Selected
                  </a>
                  <a
                    className={`text-blue-600 hover:text-blue-500 underline`}
                    onClick={addData}
                  >
                    Add
                  </a>
                </div>
              </div>
              <div className="text-red-500 mb-2">{error}</div>
              {isUploading ? (
                  <button
                    type="button"
                    className="flex items-center justify-center py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    onClick={handleUpload}
                  >
                    Upload Data
                    <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                      {csvData.length}
                    </span>
                  </button>
                )}
              <div className="mb-4 bg-white shadow rounded-lg overflow-y-scroll">
                
                
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="p-4">
                        <div className="flex items-center">
                          <input
                            id="checkbox-all-search"
                            type="checkbox"
                            checked={selectAll}
                            onChange={() => handleCheckboxChangeAll()}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor="checkbox-all-search"
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      </th>
                      <th className="px-3 py-1 whitespace-nowrap">Title</th>
                      <th className="px-3 py-1 whitespace-nowrap">Type</th>
                      <th className="px-3 py-1 whitespace-nowrap">Room</th>
                      <th className="px-3 py-1 whitespace-nowrap">Date</th>
                      <th className="px-3 py-1 whitespace-nowrap">
                        Start Time
                      </th>
                      <th className="px-3 py-1 whitespace-nowrap">End Time</th>
                      <th className="px-3 py-1 whitespace-nowrap">
                            End of Repeat
                          </th>
                      <th className="px-3 py-1 whitespace-nowrap">User</th>
                      <th className="px-3 py-1 whitespace-nowrap"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 p-2">
                    {csvData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-gray-200 hover:bg-gray-100"
                      >
                        <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              id={`checkbox-table-search-${rowIndex}`}
                              type="checkbox"
                              checked={row.selected as boolean}
                              onChange={(e) =>
                                handleCheckboxChange(rowIndex, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label
                              htmlFor={`checkbox-table-search-${rowIndex}`}
                              className="sr-only"
                            >
                              checkbox
                            </label>
                          </div>
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          {row.title}
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          {row.type}
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          {row.room}
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          {format(row.date, "yyyy/MM/dd (EEE)")}
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          {/* {toTimeInputValue(row.startTime)} */}
                          {/* {format(row.startTime, "yyyy/MM/dd (EEE) HH:mm")} */}
                          {row.startTime}
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          {/* {toTimeInputValue(row.endTime)} */}
                          {/* {format(row.endTime, "yyyy/MM/dd (EEE) HH:mm")} */}
                          {row.endTime}
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                              {format(row.endOfRepeat, "yyyy/MM/dd (EEE)")}
                            </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          {row.user}
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap text-lg">
                          <a
                            className="font-medium text-gray-400 hover:text-blue-500"
                            onClick={() => editData(rowIndex)}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </a>
                          <a
                            className="font-medium text-gray-400 hover:text-red-500 ms-4"
                            onClick={() => removeData(rowIndex)}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      {popup && selectedData && (
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
                        value={selectedData.title as string | ""}
                        onChange={handleValueChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Title of Schedule"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="user"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        User
                      </label>
                      <input
                        type="text"
                        id="user"
                        value={selectedData.user as string | ""}
                        onChange={handleValueChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Name of User"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="type"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Type
                      </label>
                      <input
                        type="text"
                        id="type"
                        value={selectedData.type as string | ""}
                        onChange={handleValueChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Type of Schedule"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="room"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Class Room
                      </label>
                      <input
                        type="text"
                        id="room"
                        value={selectedData.room as string | ""}
                        onChange={handleValueChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Name of Class Room"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="date"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={selectedData.date}
                        onChange={handleValueChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endOfRepeat"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        End of Repeat
                      </label>
                      <input
                        type="date"
                        id="endOfRepeat"
                        value={selectedData.endOfRepeat}
                        onChange={handleValueChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="startTime"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        value={selectedData.startTime}
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
                        type="time"
                        id="endTime"
                        value={selectedData.endTime}
                        onChange={handleValueChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                      />
                    </div>
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
                      value={selectedData.description as string | ""}
                      onChange={handleValueChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Description of Schedule"
                    />
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
                    onClick={() => updateData()}
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

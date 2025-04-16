"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { library } from "@fortawesome/fontawesome-svg-core";
import { faXmark, fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);
// update

type Language = {
  id: string;
  name: string;
  flag?: string;
};

type Days = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
type Periods = "1" | "2" | "L" | "3" | "4" | "5" | "6" | "7" | "E";

const sampleData = [
  {
    name: "F301",
    open: true,
  },
  {
    name: "F302",
    open: false,
  },
  {
    name: "F306",
    open: false,
  },
  {
    name: "F306",
    open: false,
  },
  {
    name: "F306",
    open: false,
  },
  {
    name: "F306",
    open: true,
  },
  {
    name: "F306",
    open: false,
  },
  {
    name: "F306",
    open: false,
  },
];

const openUi = "bg-green-200 text-green-800";
const closedUi = "bg-gray-200 text-gray-800";
const openBg = "bg-green-200";
const closedBg = "bg-gray-200";
const openText = "text-green-800";
const closedText = "text-gray-800";

const feedbackFormUrl = "https://forms.gle/ZaPPf6GbmhM3HqyX6";

const Footer = ({ lang }: { lang: string }) => {
  return (
    <div className="py-6">
      {/* <h2 className="font-semibold">凡例</h2> */}
      <div className="flex mb-4 justify-center gap-2 px-8">
        <div className="flex flex-wrap place-content-center mx-4 gap-x-4 gap-y-2">
          <div
            className={`text-sm px-2 py-2 rounded shadow ${openBg} ${openText}`}
          >
            F000
          </div>
          <a className="my-auto">
            {lang == "ja" && "空き"}
            {lang == "en" && "Available"}
          </a>
        </div>
        <div className="flex flex-wrap place-content-center mx-4 gap-x-4 gap-y-2">
          <div
            className={`text-sm px-2 py-2 rounded shadow ${closedBg} ${closedText}`}
          >
            F000
          </div>
          <div className="my-auto">
            {lang == "ja" && "使用中"}
            {lang == "en" && "Used/Reserved"}
          </div>
        </div>
      </div>
      <div className="text-xs">
        {lang === "ja" ? (
          <>
            <p className="mb-4">
              このアプリに対する
              <a href={feedbackFormUrl} className="text-blue-500 underline">
                アンケート
              </a>
              のご協力をお願いいたします。
            </p>
            <p>空き教室は個人での自習にのみ利用可能です。</p>
            <p>団体での無断利用は控えてください。</p>
            <p>また、空き状況は臨時使用が入るなど、</p>
            <p>表示と異なる場合があります。</p>
            <p>利用に際しては、教職員の指示に従ってください。</p>
            <p>このアプリに関するお問い合わせは、</p>
            <p>アンケートフォームからお願いします。</p>
          </>
        ) : lang === "en" ? (
          <>
            <p className="mb-4">
              Please send us your feedback from
              <a href={feedbackFormUrl} className="text-blue-500 underline">
                this form
              </a>
              .
            </p>
            <p>Available rooms are dedicated to personal use.</p>
            <p>Please refrain from using rooms as a group.</p>
            <p>This is updated occasionally, </p>
            <p>please follow additional istruction from university staff.</p>
            <p>Please send us the feedback form</p>
            <p>with any quesions.</p>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

const FooterButton = ({
  name,
  selected,
  action,
}: {
  name: string;
  selected: boolean;
  action: () => void;
}) => {
  return (
    <button
      className={`py-2 rounded ${
        selected ? `px-1 ${openBg}` : "px-1 hover:bg-gray-200"
      }`}
      onClick={action}
    >
      {name}
    </button>
  );
};

const days = [
  ["月", "MON"],
  ["火", "TUE"],
  ["水", "WED"],
  ["木", "THU"],
  ["金", "FRI"],
  ["土", "SAT"],
  // ['日', 'SUN'],
];

const periods = [
  ["1", "1"],
  ["2", "2"],
  ["昼", "LUN"],
  ["3", "3"],
  ["4", "4"],
  ["5", "5"],
  ["6", "6"],
  ["夜", "NGT"],
];

const periodTimes = [
  {
    name: "P1",
    startTime: "09:00",
    endTime: "10:40",
  },
  {
    name: "P2",
    startTime: "10:50",
    endTime: "12:30",
  },
  {
    name: "LUNCH",
    startTime: "12:30",
    endTime: "13:20",
  },
  {
    name: "P3",
    startTime: "13:20",
    endTime: "15:00",
  },
  {
    name: "P4",
    startTime: "15:10",
    endTime: "16:50",
  },
  {
    name: "P5",
    startTime: "17:00",
    endTime: "18:40",
  },
  {
    name: "P6",
    startTime: "18:50",
    endTime: "20:30",
  },
  {
    name: "EVENING",
    startTime: "20:30",
    endTime: "22:30",
  },
];

const Room = ({
  name,
  open,
  reservationIds,
  setSelectedResvs,
  setShowPopup,
}: {
  name: string;
  open: boolean;
  reservationIds: number[];
  setSelectedResvs: (reservationIds: number[]) => void;
  setShowPopup: (show: string) => void;
}) => {
  const handleClick = async (open: boolean) => {
    if (open) return setShowPopup("");
    setShowPopup("loading");

    const result = await fetch("/api/getResv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reservationIds }),
    });
    const data = await result.json();
    if (data.ok) {
      setSelectedResvs(data.reservations);
      setShowPopup(name);

      // console.log(data);
    }
  };

  return (
    <button
      className={`px-2 py-1 rounded shadow min-w-14 ${
        open
          ? `cursor-default ${openBg} ${openText}`
          : `${closedBg} ${closedText}`
      }`}
      onClick={() => handleClick(open)}
    >
      <p className="text-sm">{name}</p>
      <p className="text-sm">{open ? "◯" : "Ｘ"}</p>
    </button>
  );
};

type FloorProps = {
  floor: string;
  rooms: {
    name: string;
    open: boolean;
    reservationIds: number[];
  }[];
  setSelectedResvs: (reservationIds: number[]) => void;
  setShowPopup: (show: string) => void;
};
const Floor = ({
  floor,
  rooms,
  setSelectedResvs,
  setShowPopup,
}: FloorProps) => {
  const handleFloorClick = async () => {
    setShowPopup("loading");
    let floorReservationIds = rooms.flatMap((room) => room.reservationIds);

    if (floorReservationIds.length == 0) {
      setShowPopup("");
      return;
    }

    const result = await fetch("/api/getResv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reservationIds: floorReservationIds }),
    });
    const data = await result.json();
    if (data.ok) {
      setSelectedResvs(data.reservations);
      setShowPopup(`Floor ${floor}`);

      // console.log(data);
    }
  };

  return (
    <div id={`floor-${floor}`} className="flex gap-3 w-max">
      <button
        className="bg-gray-200 text-gray-800 px-3 py-4 rounded shadow mr-2"
        onClick={handleFloorClick}
      >
        {floor}
      </button>
      {rooms.map((room) => (
        <Room
          key={`${floor}-${room.name}`}
          name={room.name}
          open={room.open}
          setSelectedResvs={setSelectedResvs}
          setShowPopup={setShowPopup}
          reservationIds={room.reservationIds}
        />
      ))}
    </div>
  );
};

const Floors = ({
  day,
  periodNo,
  availability,
  setSelectedResvs,
  setShowPopup,
}: {
  day: number;
  periodNo: number;
  availability: any;
  setSelectedResvs: (reservationIds: any) => void;
  setShowPopup: (show: string) => void;
}) => {
  const { dateStr } = toDT(day, periodNo);
  const currentSelection = availability[dateStr][periodNo];
  // console.log(dateStr);
  // console.log(availability);

  return (
    <>
      {Object.keys(currentSelection)
        .sort((a, b) => b.localeCompare(a))
        .map((fKey: string) => {
          const floorData: {
            name: string;
            open: boolean;
            reservationIds: number[];
          }[] = Object.keys(currentSelection[fKey])
            .map((rKey: string) => {
              const data = {
                name: rKey,
                open: currentSelection[fKey][rKey].open,
                reservationIds: currentSelection[fKey][rKey].reservationIds,
              };
              return data;
            })
            .sort((a, b) => a.name.localeCompare(b.name));

          // console.log(day, periodNo, floorData);
          return (
            <Floor
              key={fKey}
              floor={fKey}
              rooms={floorData}
              setSelectedResvs={setSelectedResvs}
              setShowPopup={setShowPopup}
            />
          );
        })}
    </>
  );
};

const toDT = (day: number, period: number) => {
  const date = new Date();
  date.setDate(date.getDate() + ((day + 8 - date.getDay()) % 7));
  const dateStr = format(date, "yyy-MM-dd");
  const timeStr =
    periodTimes[period].startTime + "-" + periodTimes[period].endTime;
  return { dateStr, timeStr };
};

const convertType = (type: string, lang: string) => {
  if (type == "COURSE") {
    if (lang == "ja") return "授業等";
    if (lang == "en") return "Course";
  } else if (type == "FORCE") {
    if (lang == "ja") return "事務室";
    if (lang == "en") return "Office";
  } else {
    if (lang == "ja") return "その他";
    if (lang == "en") return "Other";
  }
};

export default function Home() {
  const languages: Language[] = [
    {
      id: "ja",
      name: "日本",
      flag: "🇯🇵",
    },
    {
      id: "en",
      name: "ENG",
      flag: "🇺🇸",
    },
  ];

  const [language, setLanguage] = useState<Language>(languages[0]);
  const [lang, setLang] = useState<string>(languages[0].id);
  const [showList, setShowList] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availability, setAvailability] = useState<any>({});
  const [rooms, setRooms] = useState<any>([]);
  const [roomsById, setRoomsById] = useState<any>({});
  const [selectedResvs, setSelectedResvs] = useState<any>([]);
  const [showPopup, setShowPopup] = useState<string>("");

  const changeLanguage = () => {
    setLanguage((prevLanguage) => {
      const currentIndex = languages.findIndex(
        (lang) => lang.id === prevLanguage.id
      );
      const nextIndex = (currentIndex + 1) % languages.length;

      setLang(languages[nextIndex].id);
      return languages[nextIndex];
    });
  };

  useEffect(() => {
    const handleGetOpenByPeriods = async () => {
      const date = new Date();
      const day = (date.getDay() - 1) % 7 || 0;

      let period = 0;
      const currentTime = moment.tz("Asia/Tokyo").format("HH:mm:ss");
      for (var i = 0; i < periodTimes.length; i++) {
        const endTime = moment(periodTimes[i].endTime, "HH:mm:ss");

        if (moment(currentTime, "HH:mm:ss").isBefore(endTime, "minute")) {
          period = i;
          break;
        }
      }

      setSelectedDay(day);
      setSelectedPeriod(period);

      const result = await fetch(`/api/getOpenByPeriods?facilityId=${1}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await result.json();
      if (data.ok) {
        setAvailability(data.availabilityAll);
        setRooms(data.rooms);
        setRoomsById(data.roomsById);

        // console.log(data);
        setIsLoading(false);
      }
    };

    handleGetOpenByPeriods();
  }, []);

  return (
    <div
      id="app"
      className="flex flex-col h-screen justify-between bg-white text-black"
    >
      <header className="sticky top-0 left-0 z-50 w-full flex justify-center bg-white px-4 py-4 shadow">
        <div className="w-full max-w-lg flex flex-row items-center justify-between">
          <h1 className="font-bold">roomie - Forest Gateway Chuo</h1>
          <button
            className="bg-gray-200 text-gray-800 px-2 py-2 rounded shadow"
            style={{ cursor: "pointer" }}
            onClick={() => {
              changeLanguage();
            }}
          >
            {language.name} {language.flag || ""}
          </button>
        </div>
      </header>
      <main className="relative w-full overflow-y-scroll mb-auto text-center">
        <div className="bg-gray-50 w-full flex flex-col items-center">
          <div className="p-4 w-md max-w-full overflow-x-auto">
            <div className="flex flex-col gap-3 text-sm w-max">
              {isLoading ? (
                <div className="flex gap-3 w-max">
                  <a className="cursor-default animate-pulse bg-gray-200 text-gray-200 px-3 py-4 rounded shadow mr-2">
                    0
                  </a>
                  <button
                    className={`cursor-default animate-pulse px-2 py-1 rounded shadow min-w-44 ${closedBg} ${closedText}`}
                  ></button>
                  <button
                    className={`cursor-default animate-pulse px-2 py-1 rounded shadow min-w-36 ${closedBg} ${closedText}`}
                  ></button>
                  <button
                    className={`cursor-default animate-pulse px-2 py-1 rounded shadow min-w-24 ${closedBg} ${closedText}`}
                  ></button>
                </div>
              ) : (
                <Floors
                  day={selectedDay}
                  periodNo={selectedPeriod}
                  availability={availability}
                  setSelectedResvs={setSelectedResvs}
                  setShowPopup={setShowPopup}
                />
              )}
            </div>
          </div>
          {showPopup != "" && (
            <>
              <div className="relative mx-4 my-4 p-2 min-w-64 max-w-lg border border-gray-400 text-gray-800 rounded">
                <button
                  className="absolute top-0 right-0 mx-3 my-1 text-lg text-gray-700"
                  onClick={() => setShowPopup("")}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className="text-gray-800 mb-2 flex flex-col justify-center">
                  <a>
                    {lang === "ja"
                      ? "予約リスト"
                      : lang === "en"
                      ? "Reservation List"
                      : ""}
                    {showPopup == "loading" ? "" : `　@${showPopup}`}
                  </a>
                </div>
                <div className="flex flex-col gap-2 mx-3">
                  <div className="grid grid-cols-12 gap-4  text-center text-gray-800 font-bold">
                    <div className="col-span-3 text-left truncate">
                      {showPopup.slice(0, 5) == "Floor"
                        ? lang === "ja"
                          ? "教室"
                          : lang === "en"
                          ? "Room"
                          : ""
                        : lang === "ja"
                        ? "種類"
                        : lang === "en"
                        ? "Type"
                        : ""}
                    </div>
                    <div className="col-span-2 text-right">
                      {lang === "ja" ? "開始" : lang === "en" ? "Start" : ""}
                    </div>
                    <div className="col-span-2 text-right">
                      {lang === "ja" ? "終了" : lang === "en" ? "End" : ""}
                    </div>
                    <div className="col-span-5 truncate">
                      {lang === "ja" ? "予約名" : lang === "en" ? "Title" : ""}
                    </div>
                  </div>
                  {showPopup == "loading" ? (
                    <div className="grid grid-cols-12 gap-4 text-left text-gray-600">
                      <div
                        className={`col-span-3 animate-pulse truncate rounded h-3 w-full ${closedBg}`}
                      ></div>
                      <div
                        className={`col-span-2 animate-pulse rounded h-3 w-full ${closedBg}`}
                      ></div>
                      <div
                        className={`col-span-2 animate-pulse rounded h-3 w-full ${closedBg}`}
                      ></div>
                      <div
                        className={`col-span-5 truncate animate-pulse rounded h-3 w-full ${closedBg}`}
                      ></div>
                    </div>
                  ) : (
                    <>
                      {selectedResvs.map((resv: any) => (
                        <div
                          key={resv.id}
                          className="grid grid-cols-12 gap-4 pb-1 text-center text-gray-600 relative group"
                        >
                          {/* <div className="col-span-3 truncate">{resv.type}</div> */}
                          <div className="col-span-3 truncate text-left">
                            {showPopup.slice(0, 5) == "Floor"
                              ? roomsById[resv.roomId].name
                              : convertType(resv.type, lang)}
                          </div>
                          <div className="col-span-2 text-right">
                            {format(resv.startTime, "H:mm")}
                          </div>
                          <div className="col-span-2 text-right">
                            {format(resv.endTime, "H:mm")}
                          </div>
                          <div className="col-span-5 truncate">
                            {resv.title}
                          </div>

                          <div className="absolute transform translate-y-7 right-0 hidden group-hover:flex flex-col items-end bg-gray-200 text-black text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                            <p className="font-bold">
                              {format(resv.startTime, "yyyy/MM/dd　H:mm")} -{" "}
                              {format(resv.endTime, "H:mm")}
                            </p>
                            <p className="text-xs">
                              {resv.type}　@{roomsById[resv.roomId].name}
                            </p>
                            <p className="text-xs">{resv.status}</p>
                            <p className="text-xs">{resv.title}</p>
                            <p className="text-xs">{resv.description}</p>
                            <p className="text-xs">{resv.userId}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <Footer lang={lang} />
      </main>
      <footer className="flex justify-center sticky bottom-0 left-0 ">
        <div className="w-full max-w-lg">
          <div className="z-50 w-full bg-white p-2 rounded-lg shadow-reverse-y">
            <div className="flex justify-between items-center">
              {showList ? (
                <>
                  <div className="p-1.5 my-2.5 text-base">
                    <div className="flex flex-row gap-6">
                      <div className="font-semibold">
                        {lang === "ja"
                          ? "リスト表示"
                          : lang === "en"
                          ? "List View"
                          : ""}
                      </div>
                      {(() => {
                        const { dateStr, timeStr } = toDT(
                          selectedDay,
                          selectedPeriod
                        );
                        return (
                          <div>
                            {format(new Date(dateStr), "yyyy/MM/dd") +
                              " " +
                              timeStr}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    className="flex items-center"
                    onClick={() => {
                      setShowList(!showList);
                    }}
                  >
                    <div className="flex flex-col p-1 rounded border border-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-row p-1.5 rounded border border-gray-400 font-light">
                    <div className="flex flex-row gap-1 text-sm">
                      {days.map((value, index) => (
                        <FooterButton
                          key={index}
                          name={(lang === "ja"
                            ? value[0]
                            : lang === "en"
                            ? value[1]
                            : ""
                          ).substring(0, 1)}
                          selected={selectedDay == index}
                          action={() => setSelectedDay(index)}
                        />
                      ))}
                    </div>
                    <div className="border-l border-gray-400 mx-2"></div>
                    <div className="flex flex-row gap-1">
                      {periods.map((value, index) => (
                        <FooterButton
                          key={index}
                          name={(lang === "ja"
                            ? value[0]
                            : lang === "en"
                            ? value[1]
                            : ""
                          ).substring(0, 1)}
                          selected={selectedPeriod == index}
                          action={() => setSelectedPeriod(index)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    className="flex items-center"
                    onClick={() => {
                      setShowList(!showList);
                    }}
                  >
                    <div className="flex flex-col p-1 rounded border border-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </button>
                </>
              )}
            </div>
            {showList && (
              <div
                className={`px-1.5 py-3 grid gap-1 gap-y-2 text-center border rounded-lg ${
                  lang === "en" && "text-sm"
                }`}
                style={{
                  gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                }}
              >
                {periods.map((pValue, pIndex) =>
                  days.map((dValue, dIndex) => (
                    <div
                      key={`${dIndex}-${pIndex}`}
                      className={`p-0.5 rounded ${
                        selectedDay == dIndex && selectedPeriod == pIndex
                          ? openBg
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedPeriod(pIndex);
                        setSelectedDay(dIndex);
                      }}
                    >
                      {dValue[lang === "ja" ? 0 : lang === "en" ? 1 : 0] +
                        " " +
                        pValue[lang === "ja" ? 0 : lang === "en" ? 1 : 0]}
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="mt-4 mb-2 text-center text-xs">
              Developed for GLOMAC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

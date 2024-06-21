"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import moment from "moment-timezone";
// update

type RoomProps = {
  floor?: string;
  name: string;
  open: boolean;
};

type FloorProps = {
  floor: string;
  rooms: RoomProps[];
};

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
  // ["土", "SAT"],
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

const Room = ({ name, open }: RoomProps) => {
  return (
    <button
      className={`px-2 py-1 rounded shadow min-w-14 cursor-default ${
        open ? `${openBg} ${openText}` : `${closedBg} ${closedText}`
      }`}
    >
      <p className="text-sm">{name}</p>
      <p className="text-sm">{open ? "◯" : "Ｘ"}</p>
    </button>
  );
};

const Floor = ({ floor, rooms }: FloorProps) => {
  return (
    <div id={`floor-${floor}`} className="flex gap-3 w-max">
      <a className="bg-gray-200 text-gray-800 px-3 py-4 rounded shadow mr-2">
        {floor}
      </a>
      {rooms.map((room: RoomProps) => (
        <Room
          key={`${floor}-${room.name}`}
          floor={floor}
          name={room.name}
          open={room.open}
        />
      ))}
    </div>
  );
};

const Floors = ({
  day,
  periodNo,
  availability,
}: {
  day: number;
  periodNo: number;
  availability: any;
}) => {
  const { dateStr, timeStr } = toDT(day, periodNo);
  const currentSelection = availability[dateStr][periodNo];
  // console.log(availability);
  console.log(dateStr);
  console.log(availability);

  return (
    <>
      {Object.keys(currentSelection)
        .sort((a, b) => b.localeCompare(a))
        .map((fKey: string) => {
          const floorData: any = Object.keys(currentSelection[fKey])
            .map((rKey: string) => {
              const data = {
                name: rKey,
                open: currentSelection[fKey][rKey].open,
              };
              return data;
            })
            .sort((a, b) => a.name.localeCompare(b.name));

          // console.log(day, periodNo, floorData);
          return <Floor key={fKey} floor={fKey} rooms={floorData} />;
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
    const todayStr = format(new Date(), "yyy-MM-dd");
    console.log(todayStr);

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

    fetch(`/api/getOpenByPeriods?facilityId=${1}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setAvailability(data.availabilityAll);
          setRooms(data.rooms);
          setIsLoading(false);
        }
      });
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
                />
              )}
            </div>
          </div>
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
              Developed by Kaisei Sawada
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

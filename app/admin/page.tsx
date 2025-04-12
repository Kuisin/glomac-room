"use client";
import { useRouter } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendarDays,
  faHouse,
  faRepeat,
  fas,
  faList,
} from "@fortawesome/free-solid-svg-icons";
library.add(fas);

const adminList = [
  {
    title: "Home",
    icon: faHouse,
    href: "./",
    desc: "ユーザー向けのページ",
  },
  {
    title: "Bookings List",
    icon: faList,
    href: "./admin/list",
    desc: "個別予約の一覧（編集、削除、追加）",
  },
  {
    title: "Add Recurring Bookings",
    icon: faRepeat,
    href: "./admin/courses",
    desc: "授業情報の登録",
  },
  {
    title: "Add Weekly Bookings",
    icon: faCalendarDays,
    href: "./admin/force",
    desc: "個別予約の登録",
  },
];

export default function Admin() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
        {adminList.map((item, index) => (
          <div
            key={index} 
            onClick={() => router.push(item.href)}
            className="cursor-pointer p-4 flex flex-col justify-center bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <FontAwesomeIcon
                icon={item.icon}
                className="text-2xl text-gray-500"
              />
              <a className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {item.title}
              </a>
            </div>
            <p className="text-gray-500 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

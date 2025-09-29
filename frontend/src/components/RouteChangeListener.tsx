"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearHistory } from "@/redux/uiSlice";
import { AppDispatch } from "@/redux/store";

export default function RouteChangeListener() {
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(clearHistory());
  }, [pathname, dispatch]);

  return null;
}

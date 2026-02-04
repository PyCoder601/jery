"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { clearHistory } from "@/redux/uiSlice";

export default function RouteChangeListener() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearHistory());
  }, [pathname, dispatch]);

  return null;
}

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Hooks typés à utiliser dans toute l'application au lieu des hooks non typés
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

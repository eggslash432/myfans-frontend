import { atom } from "jotai";
export const authAtom = atom<{token?:string; user?:any}>({});

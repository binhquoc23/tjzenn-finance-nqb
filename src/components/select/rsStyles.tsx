// src/components/select/rsStyles.ts
import type { GroupBase, StylesConfig } from "react-select";

type Option = { value: string; label: string };

type MakeStylesArgs = {
  maxHeight?: number;
  dark?: boolean;
  zIndex?: number;
};

export function makeSelectStyles<
  T extends Option = Option,
  M extends boolean = false,
  G extends GroupBase<T> = GroupBase<T>
>({
  maxHeight = 240,
  dark = true,
  zIndex = 99999,
}: MakeStylesArgs = {}): StylesConfig<T, M, G> {
  const bg = dark ? "#000" : "#fff";
  const text = dark ? "#fff" : "#111827";
  const border = dark ? "#4b5563" : "#d1d5db";
  const hover = dark ? "#6b7280" : "#9ca3af";
  const focus = dark ? "#111827" : "#f3f4f6";

  return {
    control: (base) => ({
      ...base,
      backgroundColor: bg,
      borderColor: border,
      minHeight: 42,
      boxShadow: "none",
      ":hover": { borderColor: hover },
    }),
    singleValue: (base) => ({ ...base, color: text }),
    input: (base) => ({ ...base, color: text }),
    placeholder: (base) => ({
      ...base,
      color: dark ? "rgba(255,255,255,0.6)" : "rgba(17,24,39,0.6)",
    }),
    menuPortal: (base) => ({ ...base, zIndex }),
    menu: (base) => ({ ...base, backgroundColor: bg }),
    menuList: (base) => ({
      ...base,
      maxHeight,
      overflowY: "auto",
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? focus : bg,
      color: text,
      cursor: "pointer",
    }),
    valueContainer: (base) => ({ ...base, paddingTop: 4, paddingBottom: 4 }),
  };
}

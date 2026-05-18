import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ComboBox, LoadingPanel } from "blaise-design-system-react-components";
import { type FocusEvent, type ReactElement, useEffect, useMemo, useRef, useState } from "react";

import axiosConfig from "../../../api/axiosConfig";
import { clientLogger } from "../../../utils/logger";

interface Props {
  label: string;
  roles: string[];
  onItemSelected?: (user: string) => void;
  onError?: (message: string) => void;
}

const MAX_VISIBLE_USERS = 10;

function FindUser({ label = "Search user", roles, onItemSelected, onError }: Props): ReactElement {
  const [search, setSearch] = useState("");
  const blurTimeoutRef = useRef<number | null>(null);
  const lastReportedSelectionRef = useRef<string | null>(null);

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ["usersByRole", roles],
    queryFn: async () => {
      const results = await Promise.all(roles.map((role) => callGetUsersByRoleCloudFunction(role)));
      const sorted = Array.from(new Set(results.filter(Boolean).flat())).sort((a, b) =>
        a.localeCompare(b),
      );

      if (onError && sorted.length === 0) {
        onError("Unable to get users");
      }

      return sorted;
    },
    enabled: roles.length > 0,
  });

  const searchDisabled = loading || users.length === 0;

  const options = useMemo<Array<{ label: string; value: string }>>(() => {
    return users.map((user) => ({ label: user, value: user }));
  }, [users]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  function reportSelection(user: string): void {
    if (lastReportedSelectionRef.current === user) {
      return;
    }

    lastReportedSelectionRef.current = user;
    onItemSelected?.(user);
  }

  function clearSearch(reportError: boolean): void {
    if (reportError && search.trim().length > 0) {
      onError?.("Username does not exist");
    }

    setSearch("");
    reportSelection("");
  }

  function isExactUserMatch(user: string): boolean {
    return users.includes(user);
  }

  function clearPendingBlurTimeout(): void {
    if (blurTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = null;
  }

  function onChange(_event: React.ChangeEvent<HTMLInputElement>, value: string): void {
    setSearch(value);

    if (isExactUserMatch(value)) {
      reportSelection(value);

      return;
    }

    reportSelection("");
  }

  function onSelect(option: { label: string; value: string } | null): void {
    clearPendingBlurTimeout();

    if (option === null) {
      reportSelection("");

      return;
    }

    setSearch(option.label);
    reportSelection(option.value);
  }

  function onBlur(_event: FocusEvent<HTMLInputElement>): void {
    blurTimeoutRef.current = window.setTimeout(() => {
      blurTimeoutRef.current = null;

      if (isExactUserMatch(search)) {
        reportSelection(search);

        return;
      }

      clearSearch(search.trim().length > 0);
    }, 100);
  }

  function onFocus(): void {
    clearPendingBlurTimeout();
  }

  async function callGetUsersByRoleCloudFunction(userRole: string): Promise<string[]> {
    const payload = { role: userRole };
    let res;

    try {
      res = await axios.post("/api/cloudFunction/getUsersByRole", payload, axiosConfig());

      return Array.isArray(res.data.message) ? res.data.message : [];
    } catch (error) {
      const errorMessage = JSON.stringify(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Unknown error",
      );

      clientLogger.info(errorMessage);

      return [];
    }
  }

  if (loading) {
    return <LoadingPanel message="Getting users" />;
  }

  return (
    <>
      <br />
      <ComboBox
        className="find-user"
        inputClassName="ons-input-type__input"
        value={search}
        disabled={searchDisabled}
        options={options}
        placeholder={label}
        maxVisibleOptions={MAX_VISIBLE_USERS}
        onChange={onChange}
        onSelect={onSelect}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    </>
  );
}

export { FindUser };

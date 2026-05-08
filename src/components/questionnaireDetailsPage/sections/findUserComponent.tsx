import axios from "axios";
import { LoadingPanel } from "blaise-design-system-react-components";
import React, { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import axiosConfig from "../../../client/axiosConfig";
import { clientLogger } from "../../../client/logger";

interface Props {
  label: string;
  roles: string[];
  onItemSelected?: (user: string) => void;
  onError?: (message: string) => void;
}

function FindUserComponent({
  label = "Search user",
  roles,
  onItemSelected,
  onError,
}: Props): ReactElement {
  const [users, setUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<boolean>(roles.length > 0);
  const initializedRolesRef = useRef<string[] | null>(null);

  const filteredUsers = useMemo(() => findUsers(search, users), [search, users]);
  const searchDisabled = loading || users.length === 0;

  const fetchUsers = useCallback(
    async (roles: string[]): Promise<string[]> => {
      const results = await Promise.all(roles.map((role) => callGetUsersByRoleCloudFunction(role)));

      const sortedArray: string[] = results
        .filter(Boolean)
        .flat()
        .sort((a, b) => a.localeCompare(b));

      if (onError && sortedArray.length === 0) {
        onError("Unable to get users");

        return [];
      }

      return sortedArray;
    },
    [onError],
  );

  useEffect(() => {
    if (
      initializedRolesRef.current &&
      JSON.stringify(roles) === JSON.stringify(initializedRolesRef.current)
    ) {
      return;
    }

    if (roles.length === 0) {
      return;
    }

    initializedRolesRef.current = roles;

    queueMicrotask(() => {
      setLoading(true);
    });

    fetchUsers(roles)
      .then((users) => {
        setUsers(users);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchUsers, roles]);

  function findUsers(user: string, users: string[]): string[] {
    return users.filter((u) => u.toLowerCase().includes(user.toLowerCase()));
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);

    if (onItemSelected && users.includes(e.target.value)) {
      onItemSelected(e.target.value);
    } else if (onItemSelected) {
      onItemSelected("");
    }
  };

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
    return <LoadingPanel message="Getting list of users" />;
  }

  return (
    <>
      <br />
      <div className="ons-field">
        <input
          className="ons-input ons-input--text ons-input-type__input"
          id="search"
          type="text"
          list="user-list"
          value={search}
          disabled={searchDisabled}
          autoComplete="off"
          onChange={onChange}
          placeholder={label}
          onBlur={() => {
            if (onItemSelected && !users.includes(search)) {
              if (onError && search.trim().length > 0) onError("Username does not exist");
              setSearch("");
              onItemSelected("");
            }
          }}
        />
        <datalist id="user-list">
          {filteredUsers.map((user) => (
            <option
              value={user}
              key={user}
            />
          ))}
        </datalist>
      </div>
    </>
  );
}

export default FindUserComponent;

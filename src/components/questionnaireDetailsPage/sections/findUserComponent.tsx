import React, { ReactElement, useEffect, useState, useRef } from "react";
import { ONSPanel, ONSLoadingPanel } from "blaise-design-system-react-components";
import axios from "axios";
import axiosConfig from "../../../client/axiosConfig";

interface Props {
    label: string;
    roles: string[];
    onItemSelected?: (user: string) => void;
    onError?: (message: string) => void;
}

function FindUserComponent({ label = "Search user", roles, onItemSelected, onError }: Props): ReactElement {
    const [users, setUsers] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
    const [searchDisabled, setSearchDisabled] = useState<boolean>(true);
    const [loading, setLoading] = useState(false);
    const hasInitialized = useRef<string[] | null>(null);

    useEffect(() => {
        if (hasInitialized.current && JSON.stringify(roles) === JSON.stringify(hasInitialized.current)) {
            return;
        }
        
        if (roles.length === 0) return;
        
        hasInitialized.current = roles; 

        setLoading(true);
        setSearchDisabled(true);

        fetchUsers(roles).then(users => {
            setUsers(users);
            setFilteredUsers(users);
        }).finally(() => {
            setLoading(false);
        });
    }, [roles]);

    useEffect(() => {
        setFilteredUsers(findUsers(search, users));
    }, [search, users]);

    async function fetchUsers(roles: string[]): Promise<string[]> {
        const results = await Promise.all(
            roles.map(role => callGetUsersByRoleCloudFunction(role))
        );
        
        const sortedArray: string[] = results.filter(Boolean).flat().sort((a, b) => a.localeCompare(b));

        if(onError && sortedArray.length == 0) {
            onError("Unable to get users");
            setSearchDisabled(true);
            return [];
        }
        else {
            setSearchDisabled(false);
            return sortedArray;
        }
    }

    function findUsers(user: string, users: string[]): string[] {
        return users.filter(u => u.toLowerCase().includes(user.toLowerCase()));
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);

        if(onItemSelected && users.includes(e.target.value))
        {
            onItemSelected(e.target.value);
        }
        else if(onItemSelected) {
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
            const errorMessage = JSON.stringify((error as any)?.response?.data?.message || "Unknown error");
            console.log(errorMessage);
            return [];
        }
    }
    if (loading) {
        return <ONSLoadingPanel message="Getting list of users" />;
    }

    return (
        <>
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
                            if(onError && search.trim().length > 0) onError("Username does not exist");
                            setSearch("");
                            onItemSelected("");
                        } 
                    }}
                />
                <datalist id="user-list">
                    {filteredUsers.map(user => (
                        <option value={user} key={user} />
                    ))}
                </datalist>
            </div>
        </>
    );
}

export default FindUserComponent;

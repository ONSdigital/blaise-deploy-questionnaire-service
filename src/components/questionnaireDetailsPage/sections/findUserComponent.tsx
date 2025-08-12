import React, { ReactElement, useEffect, useState } from "react";
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

    useEffect(() => {
        fetchUsers(roles).then(users => {
            setUsers(users);
            setFilteredUsers(users);
        });
    }, []);

    async function fetchUsers(roles: string[]): Promise<string[]> {
        const results = await Promise.all(
            roles.map(role => callGetUsersByRoleCloudFunction(role))
        );
        // Flatten and sort alphabetically
        return results.flat().sort((a, b) => a.localeCompare(b));
    }

    function findUsers(user: string, users: string[]): string[] {
        return users.filter(u => u.toLowerCase().includes(user.toLowerCase()));
    }

    useEffect(() => {
        setFilteredUsers(findUsers(search, users));
    }, [search, users, filteredUsers]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);

        if(onItemSelected && users.includes(e.target.value))
        {
            onItemSelected(e.target.value);
        }
    };

    const [loading, isLoading] = React.useState(false);

    async function callGetUsersByRoleCloudFunction(userRole: string): Promise<string[]> {
        isLoading(true);
        const payload = { role: userRole };
        let res;
        try {
            res = await axios.post("/api/cloudFunction/getUsersByRole", payload, axiosConfig());
            isLoading(false);
            setSearchDisabled(false);
            return res.data.message;
        } catch (error) {
            const errorMessage = JSON.stringify((error as any).response.data.message);
            if(onError)
            {
                onError("Unable to get users");
                setSearchDisabled(true);
            }
            isLoading(false);
            res = {
                data: errorMessage,
                status: 500
            };
            return [];
        }
    }
    if (loading) {
        return <ONSLoadingPanel message="Getting list of users" />;
    }

    return (
        <>
            <div className="ons-field">
                <label className="ons-label" htmlFor="search">{label}</label>
                <input
                    className="ons-input ons-input--text ons-input-type__input"
                    id="search"
                    type="text"
                    list="user-list"
                    value={search}
                    disabled={searchDisabled}
                    autoComplete="off"
                    onChange={onChange}
                    onBlur={() => {
                        if (onItemSelected && !users.includes(search)) {
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

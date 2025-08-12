import React, { ReactElement, useEffect, useState } from "react";
import { ONSPanel, ONSLoadingPanel } from "blaise-design-system-react-components";
import axios from "axios";
import axiosConfig from "../../../client/axiosConfig";

interface Props {
    label: string;
    onItemSelected?: (user: string) => void;
}

function FindUserComponent({ label = "Search user", onItemSelected }: Props): ReactElement {
    const [dummyUsers, setDummyUsers] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");

    useEffect(() => {
        fetchUsers().then(users => {
            setDummyUsers(users);
            setFilteredUsers(users);
        });
    }, []);

    async function fetchUsers(): Promise<string[]> {
        const result = await callGetUsersByRoleCloudFunction();
        return result;
    }

    function findUsers(user: string, users: string[]): string[] {
        return users.filter(u => u.toLowerCase().includes(user.toLowerCase()));
    }

    useEffect(() => {
        setFilteredUsers(findUsers(search, dummyUsers));
    }, [search, dummyUsers]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setSearch(e.target.value);

        if(onItemSelected && dummyUsers.includes(e.target.value))
        {
            onItemSelected(e.target.value);
        }
        //setSelectedUser("");
    };

    const [loading, isLoading] = React.useState(false);

    async function callGetUsersByRoleCloudFunction(): Promise<string[]> {
        isLoading(true);
        const payload = { role: "IPS Field Interviewer" };
        let res;
        try {
            res = await axios.post("/api/cloudFunction/getUsersByRole", payload, axiosConfig());
            console.log(res.data.message);
            isLoading(false);
            return res.data.message;
        } catch (error) {
            const errorMessage = JSON.stringify((error as any).response.data.message);
            console.log(errorMessage);
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
                    autoComplete="off"
                    onChange={onChange}
                    onBlur={() => {
                        if (onItemSelected && !dummyUsers.includes(search)) {
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

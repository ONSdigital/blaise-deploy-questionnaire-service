import React, { ReactElement, useEffect, useState } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

async function fetchUsers(): Promise<string[]> {
    return [
        "Fred", "Tim", "Erica", "Borris", "Lena", "Tom", "Nina", "Gus", "Zoe", "Cal",
        "Maya", "Leo", "Tina", "Derek", "Jill", "Nate", "Sophie", "Hank", "Clara", "Ben",
        "Liam", "Nora", "Owen", "Rita", "Jake", "Emma", "Todd", "Milo", "Dana", "Faye",
        "Wes", "Isla", "Reed", "Ava", "Carl", "Lila", "Joel", "Ivy", "Vince", "Ruby",
        "Matt", "Ellie", "Sean", "Willa", "Zack", "Grace", "Dean", "Lola", "Finn", "Beth",
        "Troy", "Mira", "Drew", "Nina", "Eli", "Mona", "Kyle", "Tess", "Brad", "Paige",
        "Gabe", "Kira", "Lou", "Maddie", "Roy", "Anya", "Mark", "Juno", "Trent", "Skye",
        "Ron", "Vera", "Chad", "Gia", "Kurt", "Thea", "Doug", "Luz", "Saul", "Indie",
        "Jed", "Lacy", "Rick", "Hope", "Neal", "Blair", "Walt", "Romy", "Joel", "Cleo",
        "Miles", "Dina", "Ralph", "Joy", "Glenn", "Nia", "Curt", "Bea", "Bryce", "Talia"
    ];
}

function findUsers(user: string, users: string[]): string[] {
    return users.filter(u => u.toLowerCase().includes(user.toLowerCase()));
}

interface FindUserComponentProps {
    label?: string;
    onChangeHandler?: (user: string) => void;
}

function FindUserComponent({ label = "Search user", onChangeHandler }: FindUserComponentProps): ReactElement {
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

    useEffect(() => {
        setFilteredUsers(findUsers(search, dummyUsers));
    }, [search, dummyUsers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setSelectedUser("");
        if (onChangeHandler) {
            onChangeHandler("");
        }
    };

    const handleUserSelect = (user: string) => {
        setSelectedUser(user);
        setSearch(user);
        if (onChangeHandler) {
            onChangeHandler(user);
        }
    };

    return (
        <>
            <div className="ons-field">
                <label className="ons-label" htmlFor="search">{label}</label>
                <input
                    id="search"
                    type="text"
                    value={search}
                    autoComplete="off"
                    onChange={handleInputChange}
                    onBlur={() => {
                        if (!dummyUsers.includes(search)) {
                            setSearch("");
                            setSelectedUser("");
                            if (onChangeHandler) {
                                onChangeHandler("");
                            }
                        } else {
                            setSelectedUser(search);
                            if (onChangeHandler) {
                                onChangeHandler(search);
                            }
                        }
                    }}
                />
                {search && filteredUsers.length > 0 && (
                    <ul
                        style={{
                            border: "1px solid #ccc",
                            padding: 0,
                            margin: 0,
                            listStyle: "none",
                            maxWidth: 200,
                            maxHeight: 8 * 32,
                            overflowY: "auto",
                            position: "absolute",
                            background: "#fff",
                            zIndex: 1000
                        }}
                    >
                        {filteredUsers.slice(0, 8).map(user => (
                            <li
                                key={user}
                                style={{
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    background: user === selectedUser ? "#eee" : "#fff"
                                }}
                                onMouseDown={() => handleUserSelect(user)}
                            >
                                {user}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

export default FindUserComponent;

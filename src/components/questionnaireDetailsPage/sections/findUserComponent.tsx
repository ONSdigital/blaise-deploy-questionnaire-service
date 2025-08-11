import React, { ReactElement, useEffect, useState } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

async function fetchUsers(): Promise<string[]> {
    return [
        "Fred", "Tim", "Erica", "Borris", "Lena", "Tom", "Nina", "Gus", "Zoe", "Cal",
        "Maya", "Leo", "Tina", "Derek", "Jill", "Nate", "Sophie", "Hank", "Clara", "Ben",
        "Liam", "Nora", "Owen", "Rita", "Jake", "Emma", "Todd", "Milo", "Dana", "Faye",
        "Wes", "Isla", "Reed", "Ava", "Carl", "Lila", "Ivy", "Vince", "Ruby",
        "Matt", "Ellie", "Sean", "Willa", "Zack", "Grace", "Dean", "Lola", "Finn", "Beth",
        "Troy", "Mira", "Drew", "Eli", "Mona", "Kyle", "Tess", "Brad", "Paige",
        "Gabe", "Kira", "Lou", "Maddie", "Roy", "Anya", "Mark", "Juno", "Trent", "Skye",
        "Ron", "Vera", "Chad", "Gia", "Kurt", "Thea", "Doug", "Luz", "Saul", "Indie",
        "Jed", "Lacy", "Rick", "Hope", "Neal", "Blair", "Walt", "Romy", "Joel", "Cleo",
        "Miles", "Dina", "Ralph", "Joy", "Glenn", "Nia", "Curt", "Bea", "Bryce", "Talia"
    ];
}

function findUsers(user: string, users: string[]): string[] {
    return users.filter(u => u.toLowerCase().includes(user.toLowerCase()));
}

interface Props {
    label: string;
    onItemSelected?: (user: string) => void;
}

function FindUserComponent({ label, onItemSelected }: Props): ReactElement {
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

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setSearch(e.target.value);

        if(onItemSelected && dummyUsers.includes(e.target.value))
        {
            onItemSelected(e.target.value);
        }
        //setSelectedUser("");
    };

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

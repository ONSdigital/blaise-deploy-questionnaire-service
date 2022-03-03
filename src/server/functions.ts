function isNumber(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function fieldPeriodFromInstrument(instrumentName: string): string {
    const monthNumberString: string = instrumentName.substring(5, 7);
    let monthNumberInt = -1;
    let month: string;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (isNumber(monthNumberString)) {
        monthNumberInt = parseInt(monthNumberString) - 1;
    } else {
        throw new Error("Month was not a integer");
    }

    if (monthNumberInt >= 0 && monthNumberInt < 12) {
        month = monthNames[monthNumberInt];
    } else {
        throw new Error("Month was dot between 1 and 12");
    }

    return month + " 20" + instrumentName.substring(3, 5);
}

export function fieldPeriodToText(instrumentName: string): string {
    try {
        return fieldPeriodFromInstrument(instrumentName);
    } catch (error: unknown) {
        console.error("Error getting field period");
        return "Field period unknown";
    }
}

export const convertTimestampAdv = (timestamp: string) => {
    let parsedDate: Date | null = null;
    let finalDateTime: string;
    const tokyoOffset = 9 * 60;

    try {
        try {
            parsedDate = new Date(timestamp);
            parsedDate.setMinutes(parsedDate.getMinutes() + tokyoOffset);
        } catch (err) {
            console.log('cannot parse date [Step 1]:', err);

            const [date, time] = timestamp.trim().split(/[ 　]+/).map(element => element.trim());
            const [years, months, days] = date.trim().split(/[./-]+/).map(element => Number(element.trim()));
            const [hours, minutes] = time.trim().split(/[:.]+/).map(element => Number(element.trim()));

            console.log(years, months, days, hours, minutes);
            parsedDate = new Date(Date.UTC(years, months - 1, days, hours, minutes));
            parsedDate.setMinutes(parsedDate.getMinutes());
        }
    } catch (err) {
        console.log('cannot parse date [Step 2]:', err);
        parsedDate = new Date();
    }
    // console.log(parsedDate);
    
    finalDateTime = parsedDate.toISOString().slice(0, -1).substring(0, 16);
    // console.log(finalDateTime);
    return finalDateTime;
}

export const toTimeInputValue = (time: string) => {
    const hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return formattedTime;
};

// const toDateInputValue = (date: string) => {
//     const parsedDate = new Date(date);
//     const tzOffset = parsedDate.getTimezoneOffset() * 60000; // offset in milliseconds
//     const localISOTime = (new Date(parsedDate.getTime() - tzOffset)).toISOString().slice(0, -1);
//     return localISOTime.substring(0, 16); // 'YYYY-MM-DDTHH:MM'
// };
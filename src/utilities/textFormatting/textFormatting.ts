function replaceUnderscoresWithSpaces(text: string) {
    const search = "_";
    const replaceWith = " ";
    return text.split(search).join(replaceWith);
}

const formatText = (text: string): string => {
    text = convertFirstCharacterToUppercase(text);
    text = replaceUnderscoresWithSpaces(text);
    return text;
};

const convertFirstCharacterToUppercase = (stringToConvert: string): string => {
    const firstCharacter = stringToConvert.substring(0, 1);
    const restString = stringToConvert.substring(1);

    return firstCharacter.toUpperCase() + restString;
};

export {formatText};

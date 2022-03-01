const formatText = (text: string): string => {
    text = titleCase(text);
    return text.replaceAll("_", " ");
};

const titleCase = (text: string): string => {
    const firstCharacter = text.substring(0, 1);
    return `${firstCharacter.toUpperCase()}${text.substring(1)}`;
};

export { formatText };

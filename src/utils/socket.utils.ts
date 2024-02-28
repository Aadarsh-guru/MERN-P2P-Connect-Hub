
function getRandomUserId(users: string[], currentUserId: string) {
    const filteredUsers = users.filter(userId => userId !== currentUserId);
    if (filteredUsers.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredUsers.length);
        return filteredUsers[randomIndex];
    }
    return null;
};

export {
    getRandomUserId,
};
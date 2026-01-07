const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, 'users.json');
const FRIENDS_FILE = path.join(__dirname, 'friends.json');
const FRIEND_REQUESTS_FILE = path.join(__dirname, 'friend_requests.json');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
const PARTY_INVITES_FILE = path.join(__dirname, 'party_invites.json');
const PARTIES_FILE = path.join(__dirname, 'parties.json');

const SALT_ROUNDS = 10;

async function ensureDataDir() {
    // No longer needed since files are in root directory
}

async function readJSON(filePath, defaultValue = {}) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await writeJSON(filePath, defaultValue);
            return defaultValue;
        }
        throw err;
    }
}

async function writeJSON(filePath, data) {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

const storage = {
    async createUser(username, password) {
        const users = await readJSON(USERS_FILE, {});
        
        if (users[username]) {
            throw new Error('Username already exists');
        }

        const user = {
            username,
            password: await hashPassword(password),
            createdAt: Date.now(),
            level: 1,
            experience: 0,
            fortzCurrency: 0,
            selectedTank: {
                color: 'blue',
                body: 'body_halftrack',
                weapon: 'turret_01_mk1'
            },
            ownedItems: {
                colors: ['blue'],
                bodies: ['body_halftrack'],
                weapons: ['turret_01_mk1']
            },
            settings: {
                sound: { master: 75, effects: 75, music: 50 },
                graphics: { quality: 'high', particles: true, shadows: true },
                controls: { 
                    moveUp: 'w', 
                    moveDown: 's', 
                    moveLeft: 'a', 
                    moveRight: 'd', 
                    shoot: 'mouse', 
                    sprint: 'shift' 
                }
            },
            stats: {
                gamesPlayed: 0,
                wins: 0,
                kills: 0,
                deaths: 0,
                totalScore: 0
            }
        };

        users[username] = user;
        await writeJSON(USERS_FILE, users);
        
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    async authenticateUser(username, password) {
        const users = await readJSON(USERS_FILE, {});
        const user = users[username];

        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    async getUser(username) {
        const users = await readJSON(USERS_FILE, {});
        const user = users[username];
        
        if (!user) {
            return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    async updateUser(username, updates) {
        const users = await readJSON(USERS_FILE, {});
        
        if (!users[username]) {
            throw new Error('User not found');
        }

        users[username] = {
            ...users[username],
            ...updates,
            password: users[username].password
        };

        await writeJSON(USERS_FILE, users);
        
        const { password: _, ...userWithoutPassword } = users[username];
        return userWithoutPassword;
    },

    async searchUsers(query) {
        const users = await readJSON(USERS_FILE, {});
        const searchLower = query.toLowerCase();
        
        return Object.keys(users)
            .filter(username => username.toLowerCase().includes(searchLower))
            .slice(0, 20)
            .map(username => ({
                username,
                level: users[username].level
            }));
    },

    async createSession(username) {
        const sessions = await readJSON(SESSIONS_FILE, {});
        const token = generateToken();
        
        sessions[token] = {
            username,
            createdAt: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
        };

        await writeJSON(SESSIONS_FILE, sessions);
        return token;
    },

    async getSession(token) {
        const sessions = await readJSON(SESSIONS_FILE, {});
        const session = sessions[token];

        if (!session || session.expiresAt < Date.now()) {
            if (session) {
                delete sessions[token];
                await writeJSON(SESSIONS_FILE, sessions);
            }
            return null;
        }

        return session;
    },

    async deleteSession(token) {
        const sessions = await readJSON(SESSIONS_FILE, {});
        delete sessions[token];
        await writeJSON(SESSIONS_FILE, sessions);
    },

    async sendFriendRequest(fromUsername, toUsername) {
        if (fromUsername === toUsername) {
            throw new Error('Cannot send friend request to yourself');
        }

        const users = await readJSON(USERS_FILE, {});
        if (!users[toUsername]) {
            throw new Error('User not found');
        }

        const friendRequests = await readJSON(FRIEND_REQUESTS_FILE, {});
        const requestKey = `${fromUsername}:${toUsername}`;
        const reverseKey = `${toUsername}:${fromUsername}`;

        if (friendRequests[requestKey]) {
            throw new Error('Friend request already sent');
        }

        if (friendRequests[reverseKey]) {
            throw new Error('This user already sent you a friend request');
        }

        const friends = await readJSON(FRIENDS_FILE, {});
        const userFriends = friends[fromUsername] || [];
        if (userFriends.includes(toUsername)) {
            throw new Error('Already friends with this user');
        }

        friendRequests[requestKey] = {
            from: fromUsername,
            to: toUsername,
            sentAt: Date.now()
        };

        await writeJSON(FRIEND_REQUESTS_FILE, friendRequests);
        return friendRequests[requestKey];
    },

    async getFriendRequests(username, type = 'received') {
        const friendRequests = await readJSON(FRIEND_REQUESTS_FILE, {});
        
        return Object.values(friendRequests).filter(req => {
            if (type === 'received') {
                return req.to === username;
            } else if (type === 'sent') {
                return req.from === username;
            }
            return false;
        });
    },

    async acceptFriendRequest(fromUsername, toUsername) {
        const friendRequests = await readJSON(FRIEND_REQUESTS_FILE, {});
        const requestKey = `${fromUsername}:${toUsername}`;

        if (!friendRequests[requestKey]) {
            throw new Error('Friend request not found');
        }

        delete friendRequests[requestKey];
        await writeJSON(FRIEND_REQUESTS_FILE, friendRequests);

        const friends = await readJSON(FRIENDS_FILE, {});
        
        if (!friends[fromUsername]) {
            friends[fromUsername] = [];
        }
        if (!friends[toUsername]) {
            friends[toUsername] = [];
        }

        if (!friends[fromUsername].includes(toUsername)) {
            friends[fromUsername].push(toUsername);
        }
        if (!friends[toUsername].includes(fromUsername)) {
            friends[toUsername].push(fromUsername);
        }

        await writeJSON(FRIENDS_FILE, friends);
        return true;
    },

    async rejectFriendRequest(fromUsername, toUsername) {
        const friendRequests = await readJSON(FRIEND_REQUESTS_FILE, {});
        const requestKey = `${fromUsername}:${toUsername}`;

        if (!friendRequests[requestKey]) {
            throw new Error('Friend request not found');
        }

        delete friendRequests[requestKey];
        await writeJSON(FRIEND_REQUESTS_FILE, friendRequests);
        return true;
    },

    async getFriends(username) {
        const friends = await readJSON(FRIENDS_FILE, {});
        const userFriends = friends[username] || [];
        
        const users = await readJSON(USERS_FILE, {});
        
        return userFriends.map(friendUsername => ({
            username: friendUsername,
            level: users[friendUsername]?.level || 1
        }));
    },

    async removeFriend(username, friendUsername) {
        const friends = await readJSON(FRIENDS_FILE, {});
        
        if (friends[username]) {
            friends[username] = friends[username].filter(f => f !== friendUsername);
        }
        if (friends[friendUsername]) {
            friends[friendUsername] = friends[friendUsername].filter(f => f !== username);
        }

        await writeJSON(FRIENDS_FILE, friends);
        return true;
    },

    async sendPartyInvite(fromUsername, toUsername) {
        if (fromUsername === toUsername) {
            throw new Error('Cannot invite yourself');
        }

        const users = await readJSON(USERS_FILE, {});
        if (!users[toUsername]) {
            throw new Error('User not found');
        }

        const parties = await readJSON(PARTIES_FILE, {});
        const targetParty = parties[toUsername];
        if (targetParty && targetParty.members.length >= 3) {
            throw new Error('User is already in a full party');
        }

        const partyInvites = await readJSON(PARTY_INVITES_FILE, {});
        const inviteKey = `${fromUsername}:${toUsername}`;

        if (partyInvites[inviteKey]) {
            throw new Error('Party invite already sent');
        }

        partyInvites[inviteKey] = {
            from: fromUsername,
            to: toUsername,
            sentAt: Date.now()
        };

        await writeJSON(PARTY_INVITES_FILE, partyInvites);
        return partyInvites[inviteKey];
    },

    async getPartyInvites(username, type = 'received') {
        const partyInvites = await readJSON(PARTY_INVITES_FILE, {});
        
        return Object.values(partyInvites).filter(invite => {
            if (type === 'received') {
                return invite.to === username;
            } else if (type === 'sent') {
                return invite.from === username;
            }
            return false;
        });
    },

    async acceptPartyInvite(fromUsername, toUsername) {
        const partyInvites = await readJSON(PARTY_INVITES_FILE, {});
        const inviteKey = `${fromUsername}:${toUsername}`;

        if (!partyInvites[inviteKey]) {
            throw new Error('Party invite not found');
        }

        delete partyInvites[inviteKey];
        await writeJSON(PARTY_INVITES_FILE, partyInvites);

        const parties = await readJSON(PARTIES_FILE, {});
        
        let party = parties[fromUsername];
        if (!party) {
            party = {
                leader: fromUsername,
                members: [fromUsername],
                createdAt: Date.now()
            };
            parties[fromUsername] = party;
        }

        if (party.members.length >= 3) {
            throw new Error('Party is full');
        }

        if (!party.members.includes(toUsername)) {
            party.members.push(toUsername);
        }

        parties[toUsername] = party;

        await writeJSON(PARTIES_FILE, parties);
        return party;
    },

    async rejectPartyInvite(fromUsername, toUsername) {
        const partyInvites = await readJSON(PARTY_INVITES_FILE, {});
        const inviteKey = `${fromUsername}:${toUsername}`;

        if (!partyInvites[inviteKey]) {
            throw new Error('Party invite not found');
        }

        delete partyInvites[inviteKey];
        await writeJSON(PARTY_INVITES_FILE, partyInvites);
        return true;
    },

    async getParty(username) {
        const parties = await readJSON(PARTIES_FILE, {});
        const party = parties[username];

        if (!party) {
            return null;
        }

        const users = await readJSON(USERS_FILE, {});
        const membersWithData = party.members.map(memberUsername => {
            const user = users[memberUsername];
            return {
                username: memberUsername,
                level: user?.level || 1,
                selectedTank: user?.selectedTank || {
                    color: 'blue',
                    body: 'body_halftrack',
                    weapon: 'turret_01_mk1'
                }
            };
        });

        return {
            leader: party.leader,
            members: membersWithData,
            createdAt: party.createdAt
        };
    },

    async leaveParty(username) {
        const parties = await readJSON(PARTIES_FILE, {});
        const party = parties[username];

        if (!party) {
            return true;
        }

        party.members = party.members.filter(m => m !== username);

        if (party.members.length === 0) {
            for (const key in parties) {
                if (parties[key] === party) {
                    delete parties[key];
                }
            }
        } else {
            if (party.leader === username) {
                party.leader = party.members[0];
            }
            
            for (const member of party.members) {
                parties[member] = party;
            }
            delete parties[username];
        }

        await writeJSON(PARTIES_FILE, parties);
        return true;
    },

    async kickPartyMember(leaderUsername, kickedUsername) {
        const parties = await readJSON(PARTIES_FILE, {});
        const party = parties[leaderUsername];

        if (!party) {
            throw new Error('Party not found');
        }

        if (party.leader !== leaderUsername) {
            throw new Error('Only the party leader can kick members');
        }

        if (!party.members.includes(kickedUsername)) {
            throw new Error('User is not in the party');
        }

        if (kickedUsername === leaderUsername) {
            throw new Error('Cannot kick yourself');
        }

        // Remove kicked member from party
        party.members = party.members.filter(m => m !== kickedUsername);

        // Update party for all remaining members
        for (const member of party.members) {
            parties[member] = party;
        }

        // Remove party reference for kicked member
        delete parties[kickedUsername];

        await writeJSON(PARTIES_FILE, parties);
        return true;
    }
};

module.exports = storage;

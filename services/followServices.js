const Follow = require('../models/follow'); // Importamos el modelo de Follow

const followUsersIds = async (identityUserId) => {
    try {
        let following = await Follow.find({ user: identityUserId })
                                    .select({ "followed":1, "_id": 0 }).exec(); // Sacamos los ids de los usuarios que sigo
        let followers = await Follow.find({ followed: identityUserId })
                            .select({ "user":1, "_id": 0 }).exec(); // Sacamos los ids de los usuarios que me siguen                

        // Convertir los ids a un array de strings
        let followingClean = [];
        following.forEach((follow) => {
            followingClean.push(follow.followed);
        });

        let followersClean = [];
        followers.forEach((follow) => {
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean
        };
    } catch (err) {
        console.error('Error fetching follow data:', err.message);
        throw new Error('Error fetching follow data');
    }
}

const followThisUser = async (identityUserId, profileUserId) => {
    try {
        let following = await Follow.findOne({ user: identityUserId, followed: profileUserId })
                                    // .select({ "followed":1, "_id": 0 }).exec(); // Sacamos los ids de los usuarios que sigo
        let followers = await Follow.findOne({ user: profileUserId, followed: identityUserId })
                                    // .select({ "user":1, "_id": 0 }).exec(); // Sacamos los ids de los usuarios que me siguen                

        return {
            following,
            followers
        };
    } catch (err) {
        console.error('Error fetching follow data:', err.message);
        throw new Error('Error fetching follow data');
    }
}

module.exports = {
    followUsersIds,
    followThisUser
}
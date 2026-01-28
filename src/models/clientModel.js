export const createEmptyClient = () => ({
    name: "",
    sex: "",
    age: "",
    emotionPattern: "",
    personality: "",
    cognition: "",
    goals: "",
    principles: "",

    // avatar-related
    avatars: [],
    selectedAvatarId: "",
});


// const clientItem = {
//     pk: `USER#${userId}`,
//     sk: `CLIENT#${clientId}`,
//     clientId,
//
//     name: body.name,
//     sex: body.sex ?? "",
//     age: body.age ?? "",
//
//     avatars: body.avatars ?? [],
//     selectedAvatarId: body.selectedAvatarId ?? "",
//
//     emotionPattern: body.emotionPattern ?? "",
//     personality: body.personality ?? "",
//     cognition: body.cognition ?? "",
//     goals: body.goals ?? "",
//     principles: body.principles ?? "",
//
//     createdAt: new Date().toISOString(),
// };
const users = [
    { name: "Michel", team: 1 },
    { name: "Bob", team: 2 },
    { name: "Marie", team: 3 },
    { name: "Julie", team: 1 },
    { name: "Claire", team: 3 }
];

const teams = users.reduce((teams, user) => {
    const team = teams.find(x => x.team === user.team);
    if (!team) {
        teams.push({ team: user.team, members: [user.name] });
    } else {
        team.members.push(user.name);
    }
    return teams;
}, []);
console.log(teams);
/* Valeur attendue :
[ { team: 1, members: [ 'Michel', 'Julie' ] },
  { team: 2, members: [ 'Bob' ] },
  { team: 3, members: [ 'Marie', 'Claire' ] } ]
*/
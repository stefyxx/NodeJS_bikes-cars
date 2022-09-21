  // 4. list of poles for the current day: including the possibility that in this day I add a new pole
  setInterval(async function myFunc() {
    polesForHistoryDay = await getConstructedPoles();
    let notInCommon = allPoles.filter(pole => {
      if (!polesForHistoryDay.map(pole => { return pole.poleName }).includes(pole.poleName)) return pole;
    })
      .concat(polesForHistoryDay.filter(pole => {
        if (!allPoles.map(pole => { return pole.poleName }).includes(pole.poleName)) return pole;
      }));
    //if there is a match, it means that the two Poles lists are different;
    //being allPoles more up to date, I can write:
    if (notInCommon.length > 0) {
      //polesForHistoryDay = allPoles; //-> NO per di history!!
      //inserisci la pole che manca -> poi sort(), in modo da metterle in ordine
      notInCommon.map(pole => polesForHistoryDay.push(pole));
      polesForHistoryDay = polesForHistoryDay.sort();
    }
  }, 86400000);
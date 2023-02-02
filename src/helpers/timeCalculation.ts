export function calculateTotal(objects) {
    var workTotal = 0;
    var breakTotal = 0;
    for (var i = 0; i < objects.length; i++) {
        var [hours, minutes] = objects[i].time.split(':');
        var duration = Number(hours) + Number(minutes) / 60;
        if (objects[i].type === "WORK") {
            workTotal += duration;
        } else {
            breakTotal += duration;
        }
    }
    var diff = workTotal - breakTotal;
    if (diff < 0) {
        diff = 0;
    }
    var workTotalHour = Math.floor(workTotal);
    var workTotalMinutes = Math.round((workTotal % 1) * 60);
    var breakTotalHour = Math.floor(breakTotal);
    var breakTotalMinutes = Math.round((breakTotal % 1) * 60);
    var diffHour = Math.floor(diff);
    var diffMinutes = Math.round((diff % 1) * 60);
    return { workTotal: `${workTotalHour}:${String(workTotalMinutes).padStart(2, "0")}`, breakTotal: `${breakTotalHour}:${String(breakTotalMinutes).padStart(2, "0")}`, diff: `${diffHour}:${String(diffMinutes).padStart(2, "0")}` };
}

export function calculateTotalRecap(objects) {
    var workTotal = 0;
    for (var i = 0; i < objects.length; i++) {
        var [hours, minutes] = objects[i].work.split(':');
        var duration = Number(hours) + Number(minutes) / 60;
            workTotal += duration;
    }
    var workTotalHour = Math.floor(workTotal);
    var workTotalMinutes = Math.round((workTotal % 1) * 60);
    return { workTotal: `${workTotalHour}:${String(workTotalMinutes).padStart(2, "0")}` };
}


export function calculateDuration(item) {
    
    var start = new Date("1970-01-01T" + item.start + "Z");
    var end = new Date("1970-01-01T" + item.end + "Z");
    if (end < start) {
        end.setMinutes(end.getMinutes() + 1440);
    }
    var duration = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    if (duration < 0) {
        duration += 24;
    }
    var hours = Math.floor(duration % 24);
    var minutes = Math.round((duration % 1) * 60);
    return `${hours}:${String(minutes).padStart(2, "0")}`;
}

export function filterByMonth(arr, day, month, year, firstDay, LastDay) {
  let items = [];
  arr.filter(item => {
    if (day >= firstDay) {
      if (month === 11) {
        if (item.month === month && item.year === year && item.day >= firstDay) {
          items.push(item)
        }
        else if (item.month === 0 && item.year === year && item.day <= LastDay) {
          items.push(item)
        }
      } else {
        if (item.month === month && item.year === year && item.day >= firstDay) {
          items.push(item)
        }
        else if (item.month === (month + 1) && item.year === year && item.day <= LastDay) {
          items.push(item)
        }
      }
    } else {
      if (month === 0) {
        if (item.month === month && item.year === year && item.day <= LastDay) {
          items.push(item)
        }
        else if (item.month === 11 && item.year === year && item.day >= firstDay) {
          items.push(item)
        }
      } else {
        if (item.month === month && item.year === year && item.day <= LastDay) {
          items.push(item)
        }
        else if (item.month === (month - 1) && item.year === year && item.day >= firstDay) {
          items.push(item)
        }
      }
    }
  });
  return items;
}


// export function getDaysOfTheWeek(date) {
//   const weekDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
//   const indexJour = weekDays.indexOf(date.toLocaleString('fr-FR', { weekday: 'long' }).toLowerCase());
//   const resultat = [];

//   if (indexJour === 0) {
//     for (let i = 0; i <= 6; i++) {
//       resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
//     }
//   } else if (indexJour === 6) {
//     for (let i = -5; i <= 1; i++) {
//       resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
//     }
//   } else {
//     for (let i = -indexJour + 1; i <= 0; i++) {
//       resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
//     }
//     for (let i = 1; i <= 7 - indexJour; i++) {
//       resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
//     }
//   }
//   return resultat;
// }

export function getDaysOfTheWeek(date) {
  const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const indexJour = joursSemaine.indexOf(date.toLocaleString('fr-FR', { weekday: 'long' }).toLowerCase());
  const resultat = [];
  console.log(date.toLocaleString('fr-FR', { weekday: 'long' }).toLowerCase())

  if (indexJour === 0) {
    for (let i = 0; i < 7; i++) {
      resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
    }
  } else if (indexJour === 6) {
    for (let i = -6; i <= 0; i++) {
      resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
    }
  } else {
    for (let i = -indexJour + 1; i <= 0; i++) {
      resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
    }
    for (let i = 1; i <= 7 - indexJour; i++) {
      resultat.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() + i));
    }
  }
  return {resultat: resultat, day : indexJour};
}

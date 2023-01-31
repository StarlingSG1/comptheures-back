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


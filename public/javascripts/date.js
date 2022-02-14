module.exports.calcDate = function (days) {
  let date = Date.now() - days;
  date = Math.floor(date / 1000);
  if (date < 60) {
    return `${date} second(s)`;
  }
  date = Math.floor(date / 60);
  if (date < 60) {
    return `${date} minute(s)`;
  }
  date = Math.floor(date / 60);
  if (date < 24) {
    return `${date} hour(s)`;
  }
  date = Math.floor(date / 24);
  if (date < 7) {
    return `${date} day(s)`;
  }
  date = Math.floor(date / 7);
  if (date < 4) {
    return `${date} week(s)`;
  }
  date = Math.floor(date / 4);
  if (date < 12) {
    return `${date} month(s)`;
  }
  date = Math.floor(date / 12);
  return `${date} year(s)`;
};

module.exports.calcDateInString = function (day, Month, Year, numDays) {
  const result = [];
  for (i = 1; i <= numDays; ++i, ++day) {
    if (day === 29) {
      if (Month === 2) {
        if (Year % 4 !== 0) {
          day = 1;
          Month += 1;
        }
      }
    }

    if (day === 30) {
      if (Month === 2) {
        day = 1;
        Month += 1;
      }
    }

    if (day === 31) {
      if (Month === 4 || Month === 6 || Month === 9 || Month === 11) {
        day = 1;
        Month += 1;
      }
    }

    if (day === 32) {
      if (
        Month === 1 ||
        Month === 3 ||
        Month === 5 ||
        Month === 7 ||
        Month === 8 ||
        Month === 10
      ) {
        day = 1;
        Month += 1;
      } else if (Month === 12) {
        day = 1;
        Month = 1;
        Year += 1;
      }
    }
    let Day = `${Month}/${day}/${Year}`;
    if (~~(Month / 10) === 0 && ~~(day / 10) === 0) {
      Day = `0${Month}/0${day}/${Year}`;
    } else if (~~(Month / 10) === 0) {
      Day = `0${Month}/${day}/${Year}`;
    } else if (~~(day / 10) === 0) {
      Day = `${Month}/0${day}/${Year}`;
    }
    result.push(Day);
  }
  return result;
};

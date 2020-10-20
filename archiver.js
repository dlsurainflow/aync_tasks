const { User, RAFT, Report, ReportHistory, Vote } = require("./models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { Pool, Client } = require("pg");
const moment = require("moment");
const report = require("./models/report");

async function archiveReport() {
  var reports = await Report.findAndCountAll({
    where: {
      createdAt: {
        [Op.lt]: new Date(new Date() - 6 * 60 * 60 * 1000),
      },
    },
  });
  console.log("Date: " + new Date(new Date() - 6 * 60 * 60 * 1000));
  console.log("Report Count: ", reports.count);
  //   console.log("Report 0:" + JSON.stringify(reports.rows[0]));
  //   console.log("Report 0 ID: " + reports.rows[0].id);
  if (reports.count !== 0) {
    for (var i = 0; i < reports.count; i++) {
      var upvote = await Vote.findAndCountAll({
        where: {
          reportID: reports.rows[i].id,
          action: "upvote",
        },
      });
      var downvote = await Vote.findAndCountAll({
        where: {
          reportID: reports.rows[i].id,
          action: "downvote",
        },
      });
      var user = await User.findOne({ where: { id: reports.rows[i].userID } });

      var score = upvote.count - downvote.count;
      var new_point = user.points + score;

      await ReportHistory.create({
        latitude: reports.rows[i].latitude,
        longitude: reports.rows[i].longitude,
        rainfall_rate: reports.rows[i].rainfall_rate,
        flood_depth: reports.rows[i].flood_depth,
        upvote: upvote.rows,
        downvote: downvote.rows,
        image: reports.rows[i].image,
        userID: reports.rows[i].userID,
        createdAt: reports.rows[i].createdAt,
        updatedAt: reports.rows[i].updatedAt,
      });

      await Report.destroy({ where: { id: reports.rows[i].id } });
      await User.update(
        { points: new_point },
        { where: { id: reports.rows[i].userID } }
      );
    }
  }
}

// setInterval(archiveReport, 10000);
setInterval(archiveReport, 300000);

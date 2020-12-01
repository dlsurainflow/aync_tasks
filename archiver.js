const { User, RAFT, Report, ReportHistory, Vote } = require("./models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// const { Pool, Client } = require("pg");
// const moment = require("moment");
// const report = require("./models/report");

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
        address: reports.rows[i].address,
        description: reports.rows[i].description,
      });

      await Report.destroy({ where: { id: reports.rows[i].id } });
      await User.update(
        { points: new_point },
        { where: { id: reports.rows[i].userID } }
      );
    }
  }
}

async function archiveRAFT() {
  var raft = await RAFT.findAndCountAll({
    where: {
      updatedAt: {
        [Op.lt]: new Date(new Date() - 12 * 60 * 60 * 1000),
      },
    },
  });
  console.log("Date: " + new Date(new Date() - 6 * 60 * 60 * 1000));
  console.log("RAFT Count: ", raft.count);
  if (raft.count !== 0) {
    for (var i = 0; i < raft.count; i++) {
      await RAFT.update({ display: 0 }, { where: { id: raft.rows[i].id } });
    }
  }
}

setInterval(archiveReport, 300000);
setInterval(archiveRAFT, 300000);
archiveReport();
archiveRAFT();

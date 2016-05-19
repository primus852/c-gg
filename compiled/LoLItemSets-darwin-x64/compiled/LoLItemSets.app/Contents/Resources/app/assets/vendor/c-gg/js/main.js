/* Global Vars */
var finalPath;
var championArray;
var championTotal;

/* Node.js Modules */
var fs = require('fs');
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var os = require('os');
var request = require("request");
var cheerio = require("cheerio");


$(document).ready(function () {


    $('#saveItems').addClass('disabled').attr('disabled', 'disabled');

    if ($('#apiGGKey').val().trim() == '') {
        $('#saveGG').attr('disabled', 'disabled');
    }

    request({
        uri: "http://champion.gg"
    }, function (error, response, body) {
        var cheer$ = cheerio.load(body);
        var s = 0;
        cheer$(".analysis-holder > small > strong").each(function () {
            var sub = $(this);
            if (s == 0) {
                $('#currentPatch').html(sub.text());
            }
            if (s == 1) {
                $('#currentAnalyse').html(sub.text());
            }
            s++;
        });
    });

    fs.stat('./config/cfg.json', function (error, stat) {
        if (error == null) {
            fs.readFile('./config/cfg.json', 'utf8', function (err, data) {
                if (err) {
                    //TODO: Visual alert
                    console.log(err);
                }
                var cfg = jQuery.parseJSON(data);
                $("#apiGGKey").val(cfg.championGG);
                $.getJSON(CHAMPION_GG_ENDPOINT_CHAMPIONS + 'champion', {
                    api_key: cfg.championGG
                })
                    .done(function (data) {
                        championArray = data;
                        championTotal = data.length;
                        $('#championCount').html('<span class="label label-success">' + championTotal + '</span> Champions in Database');
                        $('.progress-bar').css('width', '0%');
                        $('#selectLoL').removeAttr('disabled');
                    });
            });
        } else {
            $('#championCount').html('<div class="label label-danger" style="color:white;">No Champion.gg API Key</div>');
            $('#selectLoL').attr('disabled', 'disabled');
        }
    });


    $("#selectLoL").on("change", function () {
        var files = $(this)[0].files;
        for (var i = 0; i < files.length; ++i) {
            var file = files[i].name;
            var path = files[i].path;
            finalPath = path.replace(file, '');
            if (file == "lol.launcher.exe") {
                $('#selectRow').hide();
                $('#selectedPath').html('<i class="fa fa-check success"></i> lol.launcher.exe selected');
                $('#saveItems').removeClass('disabled').addClass('success').removeAttr('disabled');
            } else {
                //TODO: Sth meaningful
                alert('MÖP');
            }

        }
    });
    $("#saveGG").on("click", function () {

        var cfgObject = {};
        cfgObject.championGG = $('#apiGGKey').val();
        mkdirp('./config', function (err) {
            if (err) {
                //TODO: Visual alert
                console.log(err);
            }
            fs.writeFile('./config/cfg.json', JSON.stringify(cfgObject), function (error) {
                if (error) {
                    //TODO: Visual alert
                    console.log(err);
                }
                $.getJSON(CHAMPION_GG_ENDPOINT_CHAMPIONS + 'champion', {
                    api_key: cfgObject.championGG
                })
                    .done(function (data) {
                        championArray = data;
                        championTotal = data.length;
                        $('#championCount').html('<span class="label label-success">' + championTotal + '</span> Champions in Database');
                        $('#selectLoL').removeAttr('disabled');
                    });
            });
        });
    });

    $('#closeWindow').on('click', function () {
        window.close();
    });

    $('#apiGGKey').on('keyup', function () {
        if ($(this).val().trim() !== '') {
            $('#saveGG').removeAttr('disabled');
        }else{
            $('#saveGG').attr('disabled','disabled');
        }
    });

    $('#saveItems').on('click', function () {

        var prio;
        var currentCount = 1;
        var $myQueue = $("<div />");
        var btn = $(this);
        btn.attr('disabled', 'disabled');
        $('.progress').show();
        $('.progressResult').hide();
        $.each(championArray, function (index, champion) {
            $myQueue.queue(function (next) {
                $.getJSON(CHAMPION_GG_ENDPOINT_CHAMPION + champion.key, {
                    api_key: $('#apiGGKey').val()
                })
                    .done(function (data) {
                        console.log('Stats for %c' + champion.key + ' %cloaded', 'color:blue;', 'color:black;');
                        $('.image-circle').attr('src','./assets/vendor/c-gg/images/champions/'+champion.key+'.png');
                        fs.stat('./assets/vendor/c-gg/images/champions/'+champion.key+'.png', function(err, stat) {
                            if(err == null) {
                                console.log('Image %c' + champion.key + '.png found', 'color:green;');
                            } else if(err.code == 'ENOENT') {
                                $('.image-circle').attr('src','./assets/vendor/c-gg/images/champions/Unknown.png');
                            } else {
                                console.log('Some other error: ', err.code);
                            }
                        });
                        var currentProgress = 100 * currentCount / championTotal;
                        $('.progress-bar').css('width', currentProgress + '%');
                        if(currentProgress == 100){
                            $('.progress').hide();
                            $('.progressResult').html('<i class="fa fa-check"></i> All ItemSets downloaded.').show();
                            $('.image-circle').attr('src','./assets/vendor/c-gg/images/logo.png');
                        }
                        currentCount++;
                        prio = 1;
                        $.each(data, function (key, stats) {
                            var jsonObject = {};
                            console.log('---->Role ' + prio + ' %c' + stats.role, 'color:green;');
                            $.each(stats, function (keyStat, valStat) {
                                /* Get StarterItems */
                                if (keyStat == "firstItems") {
                                    $.each(valStat, function (keySet, valSet) {
                                        /* Get Starter for Most Games Played */
                                        if (keySet == "mostGames") {
                                            $.each(valSet, function (keyItems, valItems) {
                                                if (keyItems == "items") {
                                                    var itemArray = [];
                                                    $.each(valItems, function (keyItem, valItem) {
                                                        itemArray.push(valItem.id);
                                                    });
                                                    jsonObject.firstMostItems = itemArray;
                                                    jsonObject.firstMostText = 'Most frequent Starters (' + valSet.winPercent + '% win - ' + valSet.games + ' games)';
                                                }
                                            });
                                        }
                                        /* Get Starter for Highest Winrate */
                                        if (keySet == "highestWinPercent") {
                                            $.each(valSet, function (keyItems, valItems) {
                                                if (keyItems == "items") {
                                                    var itemArray = [];
                                                    $.each(valItems, function (keyItem, valItem) {
                                                        itemArray.push(valItem.id);
                                                    });
                                                    jsonObject.firstHighestItems = itemArray;
                                                    jsonObject.firstHighestText = 'Highest Winrate Starters (' + valSet.winPercent + '% win - ' + valSet.games + ' games)';
                                                }
                                            })
                                        }
                                    });
                                }
                                /* Get Items */
                                if (keyStat == "items") {
                                    $.each(valStat, function (keySet, valSet) {
                                        /* Get ItemBuild for Most Games Played */
                                        if (keySet == "mostGames") {
                                            $.each(valSet, function (keyItems, valItems) {
                                                if (keyItems == "items") {
                                                    var itemArray = [];
                                                    $.each(valItems, function (keyItem, valItem) {
                                                        itemArray.push(valItem.id);
                                                    });
                                                    jsonObject.regularMostItems = itemArray;
                                                    jsonObject.regularMostText = 'Most frequent Build (' + valSet.winPercent + '% win - ' + valSet.games + ' games)';
                                                }
                                            });
                                        }
                                        /* Get ItemBuild for Highest Winrate */
                                        if (keySet == "highestWinPercent") {
                                            $.each(valSet, function (keyItems, valItems) {
                                                if (keyItems == "items") {
                                                    var itemArray = [];
                                                    $.each(valItems, function (keyItem, valItem) {
                                                        itemArray.push(valItem.id);
                                                    });
                                                    jsonObject.regularHighestItems = itemArray;
                                                    jsonObject.regularHighestText = 'Highest Winrate Build (' + valSet.winPercent + '% win - ' + valSet.games + ' games)';
                                                }
                                            });
                                        }
                                    });
                                }
                                /* Get Skill Order */
                                if (keyStat == "skills") {
                                    $.each(valStat, function (keySet, valSet) {
                                        if (keySet == "mostGames") {
                                            $.each(valSet, function (keyItems, valItems) {
                                                if (keyItems == "order") {
                                                    var skillOrder = '';
                                                    var count = 0;
                                                    $.each(valItems, function (keyItem, valItem) {
                                                        skillOrder = skillOrder + valItem;
                                                        count++;
                                                        if (count == 6) {
                                                            skillOrder = skillOrder + " > ";
                                                            count = 0;
                                                        }
                                                    });
                                                    jsonObject.skillsMostText = skillOrder.substring(0, skillOrder.length - 3) + ' (' + valSet.winPercent + '% win - ' + valSet.games + ' games)';
                                                }
                                            });
                                        }
                                        if (keySet == "highestWinPercent") {
                                            $.each(valSet, function (keyItems, valItems) {
                                                if (keyItems == "order") {
                                                    var skillOrder = '';
                                                    var count = 0;
                                                    $.each(valItems, function (keyItem, valItem) {
                                                        skillOrder = skillOrder + valItem;
                                                        count++;
                                                        if (count == 6) {
                                                            skillOrder = skillOrder + " > ";
                                                            count = 0;
                                                        }
                                                    });
                                                    jsonObject.skillsHighestText = skillOrder.substring(0, skillOrder.length - 3) + ' (' + valSet.winPercent + '% win - ' + valSet.games + ' games)';
                                                }
                                            });
                                        }
                                    });
                                }

                            });

                            /* Static Trinkets and Wards */
                            jsonObject.trinketWards = ['3340', '3341', '3364', '3363'];
                            /* Static Consumables */
                            jsonObject.consumables = ['2003', '2044', '2043', '2041', '2138', '2137', '2139', '2140'];

                            /* This isn't even my final form */
                            var jsonFinal = {};
                            var blocksArray = [];
                            var blocksObject = {};

                            /* Item Row "Most Frequent Starters */
                            var itemArrayMostStarters = [];
                            var idObjectMostStarters = {};
                            $.each(jsonObject.firstMostItems, function (key, value) {
                                idObjectMostStarters.count = 1;
                                idObjectMostStarters.id = String(value); // LoL expects String
                                itemArrayMostStarters.push(idObjectMostStarters);
                                idObjectMostStarters = {}; // Needs to be cleared?
                            });
                            blocksObject.items = itemArrayMostStarters;
                            blocksObject.type = jsonObject.firstMostText;
                            blocksArray.push(blocksObject);

                            /* Item Row "Highest Winrate Starters */
                            blocksObject = {}; // Needs to be cleared??
                            var itemArrayHighestStarters = [];
                            var idObjectHighestStarters = {};
                            $.each(jsonObject.firstHighestItems, function (key, value) {
                                idObjectHighestStarters.count = 1;
                                idObjectHighestStarters.id = String(value); // LoL expects String
                                itemArrayHighestStarters.push(idObjectHighestStarters);
                                idObjectHighestStarters = {}; // Needs to be cleared?
                            });
                            blocksObject.items = itemArrayHighestStarters;
                            blocksObject.type = jsonObject.firstHighestText;
                            blocksArray.push(blocksObject);

                            /* Item Row "Most frequent Build */
                            blocksObject = {}; // Needs to be cleared??
                            var itemArrayMostRegular = [];
                            var idObjectMostRegular = {};
                            $.each(jsonObject.regularMostItems, function (key, value) {
                                idObjectMostRegular.count = 1;
                                idObjectMostRegular.id = String(value); // LoL expects String
                                itemArrayMostRegular.push(idObjectMostRegular);
                                idObjectMostRegular = {}; // Needs to be cleared?
                            });
                            blocksObject.items = itemArrayMostRegular;
                            blocksObject.type = jsonObject.regularMostText;
                            blocksArray.push(blocksObject);

                            /* Item Row "Highest Winrate Build */
                            blocksObject = {}; // Needs to be cleared??
                            var itemArrayHighestRegular = [];
                            var idObjectHighestRegular = {};
                            $.each(jsonObject.regularHighestItems, function (key, value) {
                                idObjectHighestRegular.count = 1;
                                idObjectHighestRegular.id = String(value); // LoL expects String
                                itemArrayHighestRegular.push(idObjectHighestRegular);
                                idObjectHighestRegular = {}; // Needs to be cleared?
                            });
                            blocksObject.items = itemArrayHighestRegular;
                            blocksObject.type = jsonObject.regularHighestText;
                            blocksArray.push(blocksObject);

                            /* Item Row "Wards & Trinkets" */
                            blocksObject = {}; // Needs to be cleared??
                            var itemArrayTrinkets = [];
                            var idObjectTrinkets = {};
                            $.each(jsonObject.trinketWards, function (key, value) {
                                idObjectTrinkets.count = 1;
                                idObjectTrinkets.id = String(value); // LoL expects String
                                itemArrayTrinkets.push(idObjectTrinkets);
                                idObjectTrinkets = {}; // Needs to be cleared?
                            });
                            blocksObject.items = itemArrayTrinkets;
                            blocksObject.type = jsonObject.skillsMostText;
                            blocksArray.push(blocksObject);

                            /* Item Row "Consumables" */
                            blocksObject = {}; // Needs to be cleared??
                            var itemArrayConsumables = [];
                            var idObjectConsumables = {};
                            $.each(jsonObject.consumables, function (key, value) {
                                idObjectConsumables.count = 1;
                                idObjectConsumables.id = String(value); // LoL expects String
                                itemArrayConsumables.push(idObjectConsumables);
                                idObjectConsumables = {}; // Needs to be cleared?
                            });
                            blocksObject.items = itemArrayConsumables;
                            blocksObject.type = jsonObject.skillsHighestText;
                            blocksArray.push(blocksObject);


                            /* This is my final form */
                            jsonFinal.map = "any";
                            jsonFinal.isGlobalForChampions = false;
                            jsonFinal.blocks = blocksArray;
                            jsonFinal.associatedChampions = [];
                            jsonFinal.title = stats.role;
                            jsonFinal.priority = false;
                            jsonFinal.mode = "any";
                            jsonFinal.isGlobalForMaps = true;
                            jsonFinal.associatedMaps = [];
                            jsonFinal.type = "custom";
                            jsonFinal.softrank = prio;
                            jsonFinal.champion = champion.key;

                            /* Folder& Files */
                            mkdirp('./ItemSets/Config/Champions/' + champion.key + '/Recommended', function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                fs.writeFile('./ItemSets/Config/Champions/' + champion.key + '/Recommended/' + stats.role + '.json', JSON.stringify(jsonFinal), function (error) {
                                    if (error) {
                                        console.log(err);
                                    }
                                    console.log('%c' + champion.key + ' (%c' + stats.role + '%c) was saved', 'color:blue;', 'color:red;', 'color:black;');
                                });
                            });

                            /* Count Role Up */
                            prio++;
                        });
                        // Next in Queue
                        next();
                    });
            });
        });

        // Copy Folder to LoL Folder
        ncp('./ItemSets', finalPath, function (err) {
            if (err) {
                console.log(err);
            }
        });
        btn.removeAttr('disabled');
    });
});
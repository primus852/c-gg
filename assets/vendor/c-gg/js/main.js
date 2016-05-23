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
var open = require("open");


$(document).ready(function () {


    /* Cache jQuery Slectors. Thanks PhpStorm... */
    /* IDs */
    var $saveItems = $('#saveItems');
    var $downloadItems = $('#downloadItems');
    var $apiGGKey = $('#apiGGKey');
    var $saveGG = $('#saveGG');
    var $currentPatch = $('#currentPatch');
    var $currentAnalyze = $('#currentAnalyze');
    var $championCount = $('#championCount');
    var $currentChampion = $('#currentChampion');
    var $selectLoL = $('#selectLoL');
    var $getGG = $("#getGG");
    var $closeWindow = $('#closeWindow');

    /* Classes */
    var $progressBar = $('.progress-bar');
    var $startCrawl = $('.startCrawl');
    var $progress = $('.progress');
    var $progressResult = $('.progressResult');
    var $imageCircle = $('.image-circle');

    
    /* Disable the DL & Copy Button */
    $saveItems.addClass('disabled').attr('disabled', 'disabled');

    /* Check if API Key is empty, if so disable save */
    if ($apiGGKey.val().trim() == '') {
        $saveGG.attr('disabled', 'disabled');
    }

    /* Make inital request to gather Patch / Analyzed Games */
    request({
        uri: "http://champion.gg"
    }, function (error, response, body) {
        /* The Cheerio Stuff */
        var cheer$ = cheerio.load(body);
        var s = 0;
        /* Find in Source Code */
        cheer$(".analysis-holder > small > strong").each(function () {
            var sub = $(this);
            if (s == 0) {
                $currentPatch.html(sub.text());
            }
            if (s == 1) {
                $currentAnalyze.html(sub.text());
            }
            s++;
        });
    });

    /* Check if Config File exists */
    fs.stat('./config/cfg.json', function (error, stat) {
        if (error == null) {
            /* Config exists */
            fs.readFile('./config/cfg.json', 'utf8', function (err, data) {
                if (err) {
                    //TODO: Visual alert
                    console.log(err);
                }
                /* Parse JSON Config */
                var cfg = jQuery.parseJSON(data);

                /* Display in Input */
                $apiGGKey.val(cfg.championGG);

                /* Enable Download Only Button if API Key is present */
                $downloadItems.removeClass('disabled');

                /* Get total amount of champions from Champion.GG API */
                $.ajax({
                    url: CHAMPION_GG_ENDPOINT_CHAMPIONS + 'champion',
                    dataType: 'json',
                    data: {
                        api_key: cfg.championGG
                    },
                    success: function (data) {
                        /* Important Array to loop through and get Items later */
                        championArray = data;

                        /* Total Champions */
                        championTotal = data.length;

                        /* Display Champion No */
                        $championCount.html('<span class="label label-success">' + championTotal + '</span> Champions in Database');

                        /* Reset Progressbar */
                        $progressBar.css('width', '0%');

                        /* Enable Launcher Select Button */
                        $selectLoL.removeAttr('disabled');
                    },
                    error: function (data) {
                        /* Check for Errors */
                        $championCount.html('<span class="label label-danger">Could not connect to Champion.gg</span>');
                    }
                });

            });
        } else {
            /* Config does not exist */
            $championCount.html('<div class="label label-danger" style="color:white;">No Champion.gg API Key</div>');

            /* Disable Launcher Select Button */
            $selectLoL.attr('disabled', 'disabled');
        }
    });


    /* Detect if a file was selected */
    $selectLoL.on("change", function () {
        var files = $(this)[0].files;
        for (var i = 0; i < files.length; ++i) {

            /* Get file details */
            var file = files[i].name;
            var path = files[i].path;

            /* Get path to copy ItemSets later */
            finalPath = path.replace(file, '');

            /* Select Launcher */
            /* TODO: Find Mac filenames */
            if (file == "lol.launcher.exe" || file == "lol.admin.launcher.exe") {
                /* Enable DL & COPY Button */
                $saveItems.removeClass('disabled').addClass('success').removeAttr('disabled');
            } else {
                //TODO: Something more appealing
                alert('Please select the LoL Launcher File');
            }

        }
    });

    /* Get Champion.GG API Key from Website (open default browser) */
    $getGG.on("click", function () {
        open('http://api.champion.gg');
    });

    /* Save Champion.GG API Key */
    $saveGG.on("click", function () {

        var cfgObject = {};
        cfgObject.championGG = $apiGGKey.val();

        /* Check if config folder exists */
        mkdirp('./config', function (err) {
            /* If there was an error creating the folder */
            if (err) {
                //TODO: Something more appealing
                alert(err);
            }
            /* Write the config file to disk */
            fs.writeFile('./config/cfg.json', JSON.stringify(cfgObject), function (error) {
                /* If there was an error creating the file */
                if (error) {
                    //TODO: Something more appealing
                    alert(err);
                }

                /* Show Spinner for "Champions in Database" */
                $championCount.html('<i class="fa fa-spin fa-spinner"></i>');

                /* Make simple Ajax Call (to remove the loading spinners) */
                /* TODO: Move this to it's own function for using here and on load */
                $.ajax({
                    url: CHAMPION_GG_ENDPOINT_CHAMPIONS + 'champion',
                    dataType: 'json',
                    data: {
                        api_key: cfgObject.championGG
                    },
                    success: function (data) {
                        /* Important Array to loop through and get Items later */
                        championArray = data;

                        /* Total Champions */
                        championTotal = data.length;

                        /* Display Champion No */
                        $championCount.html('<span class="label label-success">' + championTotal + '</span> Champions in Database');

                        /* Reset Progressbar */
                        $progressBar.css('width', '0%');

                        /* Enable Launcher Select Button */
                        $selectLoL.removeAttr('disabled');

                        /* Enable Download Only Button if API Key is present */
                        $downloadItems.removeClass('disabled');
                    },
                    error: function (data) {
                        /* Check for Errors */
                        $championCount.html('<span class="label label-danger">Could not connect to Champion.gg</span>');
                    }
                });
            });
        });
    });

    /* Own Close Button top right */
    $closeWindow.on('click', function () {
        window.close();
    });

    /* Enable Save Button for Champion.GG API Key Input */
    $apiGGKey.on('keyup', function () {
        if ($(this).val().trim() !== '') {
            $saveGG.removeAttr('disabled');
        } else {
            $saveGG.attr('disabled', 'disabled');
        }
    });

    /* The fun part, the crawling and saving */
    $startCrawl.on('click', function () {

        /* Declare needed vars, easy... */
        var prio;
        var btn = $(this);
        var dlType = btn.attr('id');
        var currentCount = 1;
        var $myQueue = $("<div />"); // Disclaimer: I have absolutely no idea what this does... Captain?
        var cError = 0;

        /* GUI Stuff, not hard either */
        $startCrawl.attr('disabled', 'disabled').addClass('disabled');
        $progress.show();
        $progressResult.hide();

        /* Mother of God, that's a huge foreach loop */
        $.each(championArray, function (index, champion) {

            /* Again, not 100% sure how this works, but it queues the requests. Thanks Cpt. Obvious */
            $myQueue.queue(function (next) {

                /* Make ajax call to Champion Endpoint of Champion.GG API */
                $.ajax({
                    url: CHAMPION_GG_ENDPOINT_CHAMPION + champion.key,
                    dataType: 'json',
                    data: {
                        api_key: $apiGGKey.val()
                    },
                    success: function (data) {
                        /* It worked, yay */

                        /* This is legacy; Keep it for debugging */
                        console.log('Stats for %c' + champion.key + ' %cloaded', 'color:blue;', 'color:black;');

                        /* Update the Champion Image */
                        $imageCircle.attr('src', './assets/vendor/c-gg/images/champions/' + champion.key + '.png');

                        /* Check if Champion Image exists (never play on patch day), if not show ? image */
                        fs.stat('./assets/vendor/c-gg/images/champions/' + champion.key + '.png', function (err, stat) {

                            if (err == null) {
                                /* Image found */
                                /* Legacy Console */
                                console.log('Image %c' + champion.key + '.png found', 'color:green;');
                            } else if (err.code == 'ENOENT') {
                                /* Image not found */
                                $imageCircle.attr('src', './assets/vendor/c-gg/images/champions/Unknown.png');
                            } else {
                                /* TODO: Something more appealing, Or not? */
                                /* Legacy Console */
                                console.log('Failed to load: ', err.code);
                            }
                        });

                        /* Update Progressbar step */
                        var currentProgress = 100 * currentCount / championTotal;
                        $progressBar.css('width', currentProgress + '%');
                        $currentChampion.html(champion.name);

                        /* Check if progress is at 100%
                         * This seems to be the only reliable check if everything is actually finished
                         * So, whatever, do all "finish" stuff in here
                         */
                        if (currentProgress == 100) {

                            /* Reset GUI Stuff */
                            $progress.hide();
                            $imageCircle.attr('src', './assets/vendor/c-gg/images/logo.png');
                            $currentChampion.html('&nbsp;');
                            $startCrawl.removeAttr('disabled').removeClass('disabled');

                            /* Check if there have been any errors. Champion.GG throws some 500 Errors from time to time */
                            if (cError > 0) {
                                /* TODO: More details */
                                $currentChampion.html('<span class="label label-danger">Some Champions are missing, please run again</span>');
                            }
                            /* Check what Button was clicked */
                            if (dlType == 'saveItems') {
                                /* Save to LoL Folder */
                                $progressResult.html('<i class="fa fa-check"></i> All ItemSets downloaded and saved to LoL folder.').show();
                            }else{
                                /* Save to Local Folder */
                                $progressResult.html('<i class="fa fa-check"></i> All ItemSets downloaded to local ItemSets folder.').show();
                            }
                        }
                        /* Count Up for Progressbar */
                        currentCount++;

                        /* Sortorder in LoL Shop */
                        prio = 1;

                        /* Go through the returned data */
                        $.each(data, function (key, stats) {
                            /* Magic Object */
                            var jsonObject = {};

                            /* Legacy Console */
                            console.log('---->Role ' + prio + ' %c' + stats.role, 'color:green;');

                            /* Loop through ItemSets */
                            $.each(stats, function (keyStat, valStat) {

                                /* Get StarterItems */
                                if (keyStat == "firstItems") {

                                    /* Starter Builds */
                                    $.each(valStat, function (keySet, valSet) {

                                        /* Get Starter for Most Games Played */
                                        if (keySet == "mostGames") {

                                            /* Actual Items */
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

                                            /* Actual Items */
                                            $.each(valSet, function (keyItems, valItems) {

                                                if (keyItems == "items") {
                                                    var itemArray = [];

                                                    $.each(valItems, function (keyItem, valItem) {
                                                        itemArray.push(valItem.id);
                                                    });

                                                    jsonObject.firstHighestItems = itemArray;
                                                    jsonObject.firstHighestText = 'Highest Winrate Starters (' + valSet.winPercent + '% win - ' + valSet.games + ' games)';
                                                }
                                            });
                                        }
                                    });
                                }
                                /* Get Items */
                                if (keyStat == "items") {
                                    /* Full Builds */
                                    $.each(valStat, function (keySet, valSet) {

                                        /* Get ItemBuild for Most Games Played */
                                        if (keySet == "mostGames") {

                                            /* Actual Items */
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

                                            /* Actual Items */
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

                                            /* Most Games, what to Max? */
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

                                            /* Highest Winrate, what to max? */
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

                            /* Item Row "Most Frequent Starters" */
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

                            blocksObject = {}; // Needs to be cleared??

                            /* Item Row "Highest Winrate Starters */
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

                            blocksObject = {}; // Needs to be cleared??

                            /* Item Row "Most frequent Build */
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

                            blocksObject = {}; // Needs to be cleared??

                            /* Item Row "Highest Winrate Build */
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

                            blocksObject = {}; // Needs to be cleared??

                            /* Item Row "Wards & Trinkets" */
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

                            blocksObject = {}; // Needs to be cleared??

                            /* Item Row "Consumables" */
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

                            /* Create Folder& Files */
                            mkdirp('./ItemSets/Config/Champions/' + champion.key + '/Recommended', function (err) {
                                if (err) {
                                    /* TODO: Somethig more appealing. */
                                    alert(err);
                                    /* Legacy Console */
                                    console.log(err);
                                }

                                /* Write to File */
                                fs.writeFile('./ItemSets/Config/Champions/' + champion.key + '/Recommended/' + stats.role + '.json', JSON.stringify(jsonFinal), function (error) {
                                    if (error) {
                                        /* TODO: Somethig more appealing. */
                                        alert(err);
                                        /* Legacy Console */
                                        console.log(err);
                                    }
                                    /* Legacy Console */
                                    console.log('%c' + champion.key + ' (%c' + stats.role + '%c) was saved', 'color:blue;', 'color:red;', 'color:black;');
                                });
                            });

                            /* Count Role Up */
                            prio++;
                        });
                        // Next in Queue
                        next();
                    },
                    error: function (data) {
                        /* Count up the Errors
                         * Maybe add more details?
                         */
                        cError++;
                    }
                });
            });
        });

        /* Copy Folder to LoL Folder if "saveItems" was clicked */
        if (dlType == 'saveItems') {
            ncp('./ItemSets', finalPath, function (err) {
                if (err) {
                    /* TODO: Somethig more appealing. */
                    alert(err);
                    /* Legacy Console */
                    console.log(err);
                }
            });
        }
        /* Done, THIS GETS TRIGGERED EARLIER? WHY? */
        btn.removeAttr('disabled');
    });
});
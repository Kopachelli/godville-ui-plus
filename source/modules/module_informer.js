// informer
window.GUIp = window.GUIp || {};

GUIp.informer = {};

GUIp.informer.iconBlank = GUIp.common.getResourceURL('images/icon_blank.png');
GUIp.informer.iconGodville = GUIp.common.getResourceURL('images/icon_original.png');

GUIp.informer.init = function() {
    //title saver
    this.title = document.title;
    //favicon saver
    this.favicon = document.querySelector('link[rel="shortcut icon"]');
    // container
    document.getElementById('main_wrapper').insertAdjacentHTML('afterbegin', '<div id="informer_bar" />');
    this.container = document.getElementById('informer_bar');

    // load
    GUIp.informer._load();
};

GUIp.informer._load = function() {
    this.flags = JSON.parse(GUIp.storage.get('informer_flags') || '{}');
    for (var flag in this.flags) {
        if (this.flags[flag]) {
            delete this.flags[flag];
        }
    }
    GUIp.informer._save();
};
GUIp.informer._save = function() {
    GUIp.storage.set('informer_flags', JSON.stringify(this.flags));
};
GUIp.informer._createLabel = function(flag) {
    var id = flag.replace(/ /g, '_');
    this.container.insertAdjacentHTML('beforeend', '<div id="' + id + '">' + flag + '</div>');
    document.getElementById(id).onclick = function(e) {
        GUIp.informer.hide(flag);
        e.stopPropagation();
    };
};
GUIp.informer._deleteLabel = function(flag) {
    var label = document.getElementById(flag.replace(/ /g, '_'));
    if (label) {
        this.container.removeChild(label);
    }
};
GUIp.informer._tick = function() {
    // пройти по всем флагам и выбрать те, которые надо показывать
    var activeFlags = [];
    for (var flag in this.flags) {
        if (this.flags[flag]) {
            activeFlags.push(flag);
        }
    }
    activeFlags.sort();

    // если есть чё, показать или вернуть стандартный заголовок
    if (activeFlags.length) {
        GUIp.informer._updateTitle(activeFlags);
        this.tref = setTimeout(function() { GUIp.informer._tick(); }, 700);
    } else {
        GUIp.informer.clearTitle();
        this.tref = 0;
    }
};
GUIp.informer.clearTitle = function() {
    for (var flag in this.flags) {
        if (this.flags[flag]) {
            return;
        }
    }
    document.title = GUIp.informer._getTitleNotices() + this.title;
    this.favicon.href = GUIp.informer.iconGodville;
};
GUIp.informer._getTitleNotices = function() {
    var forbidden_title_notices = GUIp.storage.get('Option:forbiddenTitleNotices') || '';
    var titleNotices = (!forbidden_title_notices.match('pm') ? GUIp.informer._getPMTitleNotice() : '') +
                       (!forbidden_title_notices.match('gm') ? GUIp.informer._getGMTitleNotice() : '') +
                       (!forbidden_title_notices.match('fi') ? GUIp.informer._getFITitleNotice() : '');
    return titleNotices ? titleNotices + ' ' : '';
};
GUIp.informer._getPMTitleNotice = function() {
    var pm = 0,
        pm_badge = document.querySelector('.fr_new_badge_pos');
    if (pm_badge && pm_badge.style.display !== 'none') {
        pm = +pm_badge.textContent;
    }
    var stars = document.querySelectorAll('.msgDock .fr_new_msg');
    for (var i = 0, len = stars.length; i < len; i++) {
        if (!stars[i].parentNode.getElementsByClassName('dockfrname')[0].textContent.match(/Гильдсовет|Guild Council/)) {
            pm++;
        }
    }
    return pm ? '[' + pm + ']' : '';
};
GUIp.informer._getGMTitleNotice = function() {
    var gm = document.getElementsByClassName('gc_new_badge')[0].style.display !== 'none',
        stars = document.querySelectorAll('.msgDock .fr_new_msg');
    for (var i = 0, len = stars.length; i < len; i++) {
        if (stars[i].parentNode.getElementsByClassName('dockfrname')[0].textContent.match(/Гильдсовет|Guild Council/)) {
            gm = true;
            break;
        }
    }
    return gm ? '[g]' : '';
};
GUIp.informer._getFITitleNotice = function() {
    return document.querySelector('#forum_informer_bar a') ? '[f]' : '';
};
GUIp.informer._updateTitle = function(activeFlags) {
    this.odd_tick = !this.odd_tick;
    var sep = this.odd_tick ? '!!!' : '...';
    document.title = GUIp.informer._getTitleNotices() + sep + ' ' + activeFlags.join('! ') + ' ' + sep;
    if (GUIp.browser !== 'opera' && !GUIp.storage.get('Option:disableFaviconFlashing')) {
        this.favicon.href = this.odd_tick ? GUIp.informer.iconGodville
                                          : GUIp.informer.iconBlank;
    } else if (this.favicon.href !== GUIp.informer.iconGodville) {
        this.favicon.href = GUIp.informer.iconGodville;
    }
};
GUIp.informer.update = function(flag, value) {
    if (value &&
       (flag === 'fight' || flag === 'low health' || !GUIp.stats.isFight()) &&
      !(flag === 'much gold' && GUIp.stats.hasTemple() && GUIp.stats.townName()) &&
      !(GUIp.storage.get('Option:forbiddenInformers') && GUIp.storage.get('Option:forbiddenInformers').match(flag.replace(/ /g, '_')))
    ) {
        if (this.flags[flag] === undefined) {
            this.flags[flag] = true;
            GUIp.informer._createLabel(flag);
            GUIp.informer._save();
            if (!this.tref) {
                GUIp.informer._tick();
            }
            /* [E] desktop notifications */
            if (GUIp.storage.get('Option:enableInformerAlerts') && GUIp.browser !== 'opera' && Notification.permission === "granted") {
                var title = '[INFO] ' + GUIp.stats.godName(),
                    text = flag,
                    callback = function(){GUIp.informer.hide(flag);};
                GUIp.utils.showNotification(title,text,callback);
            }
            /* [E] if flag is 'tamable' then play arena sound (as no other sounds are available). feature requested by... заядлые звероводы из Рядов Фурье ^_^ */
            if (flag === 'tamable monster') {
                if (window.so.play_sound_orig) {
                    window.so.play_sound_orig('arena.mp3',false);
                }
            }
        }
    } else if (this.flags[flag] !== undefined) {
        delete this.flags[flag];
        GUIp.informer._deleteLabel(flag);
        GUIp.informer._save();
    }
};
GUIp.informer.hide = function(flag) {
    this.flags[flag] = false;
    GUIp.informer._deleteLabel(flag);
    GUIp.informer._save();
};

GUIp.informer.loaded = true;

document.currentScript.remove();

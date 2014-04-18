Package.describe({
    summary: "Getting Microphone input from user"
});

Package.on_use(function(api, where) {
    api.use(['deps', 'ui'], 'client');
    api.add_files(['src/microphone.js'], 'client');

    if (api.export)
        api.export('Microphone');
});

// Package.on_test(function(api) {
//     api.use(['underscore', 'ejson', 'deps', 'settings-manager', 'ui', 'tinytest', 'test-helpers']);
//     api.add_files(['tests/basictests.js'], 'client');
// })
/**
 * Created by justinmiller on 4/2/15.
 */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var objLoader = new THREE.OBJLoader();

var tile = {
    height: .25,
    width: .25,
    center: .125,
    translate: .475
};

var pieceInfo = [
    {name: "Pawn", count: 16, pos: []},
    {name: "Rook", count: 4},
    {name: "Knight", count: 4},
    {name: "Bishop", count: 4},
    {name: "Queen", count: 2},
    {name: "King", count: 2}
];
var pieces = [];

//loadPieces(pieceInfo);

var pawn;

objLoader.load("/assets/models/" + pieceInfo[0].name + ".obj", function(object) {
    object.traverse( function ( child ) {

        if (child instanceof THREE.Mesh) {
            pawn = child;
            child.material = new THREE.MeshLambertMaterial({color: 0x555555});
            child.position.set(.25,-1.2,.4);
            child.scale.set(.025, .025, .025);
            child.rotation.z = -.1;
            child.rotation.x = 1.6;
            child.rotation.y = 1.7;
            scene.add(child);
            animatePawn(pawn);
        }
    });
});

var boardTexture = new THREE.ImageUtils.loadTexture("/assets/textures/board-pattern.png");
boardTexture.repeat.set(4,4);
boardTexture.wrapS = THREE.RepeatWrapping;
boardTexture.wrapT = THREE.RepeatWrapping;

var boardMaterials = [

    new THREE.MeshLambertMaterial({color: 0x555555}),
    new THREE.MeshLambertMaterial({color: 0x555555}),
    new THREE.MeshLambertMaterial({color: 0x555555}),
    new THREE.MeshLambertMaterial({color: 0x555555}),
    new THREE.MeshLambertMaterial({ map: boardTexture }),
    new THREE.MeshLambertMaterial({color: 0x555555})

];

var geometry = new THREE.BoxGeometry( 4, 4, 0.4);
var board = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(boardMaterials) );
scene.add( board );

var light = new THREE.AmbientLight( 0x555555 ); // soft white light
scene.add( light );

var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 50, 100, 50 );

spotLight.castShadow = true;

spotLight.shadowMapWidth = 1024;
spotLight.shadowMapHeight = 1024;

spotLight.shadowCameraNear = 500;
spotLight.shadowCameraFar = 4000;
spotLight.shadowCameraFov = 30;

scene.add( spotLight );

camera.position.z = 4;

function render() {
    requestAnimationFrame( render );
    TWEEN.update();
    renderer.render( scene, camera );
}
render();

function loadAllOfPieceType(values) {
    for (var index = 0; index < values.count; index++) {
        objLoader.load("/assets/models/" + values.name + ".obj", function(object) {
            object.traverse( function ( child ) {

                if (child instanceof THREE.Mesh) {
                    if (index < values.count/2) {
                        child.material.map = new THREE.MeshBasicMaterial({color: 0x000000});
                    } else {
                        child.material.map = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
                    }
                }

            } );
            pieces.push(object);
        })
    }
}

function loadPieces(valuesArray) {
    for (var value in valuesArray) {
        loadAllOfPieceType(valuesArray[value]);
    }
}

var TweenUp = function(piece) {

    var position = piece.position;
    var target = {z: position.z + .6};
    var tween = new TWEEN.Tween(piece.position).to(target, 1000);

    tween.onUpdate(function() {
        piece.position.z = position.z;
    });

    return tween;
};

var TweenDown = function(piece) {
    var position = piece.position;
    var target = {z: position.z};
    var tween = new TWEEN.Tween(piece.position).to(target, 1000);
    tween.onUpdate(function() {
        piece.position.z = position.z;
    });
    return tween;
};

var TweenSpacesUp = function(piece, spaces) {
    var position = piece.position;
    var target = {y: position.y + tile.translate*spaces};
    var tween = new TWEEN.Tween(piece.position).to(target, 3000);
    tween.onUpdate(function() {
        piece.position.y = position.y;
    });
    return tween;
};

var TweenSpacesDiagonal = function(piece, spacesX, spacesY) {
    var position = piece.position;
    var target = {y: position.y + tile.translate*spacesY, x: position.x +tile.translate*spacesX};
    var tween = new TWEEN.Tween(piece.position).to(target, 3000);
    tween.onUpdate(function() {
        piece.position.y = position.y;
        piece.position.x = position.x;
    });
    return tween;
};

function animatePawn(pawn) {
    var tweenUp = TweenUp(pawn);
    var tweenOneUp = TweenSpacesDiagonal(pawn, 3, 3);
    var tweenDown = TweenDown(pawn);
    tweenUp.chain(tweenOneUp);
    tweenOneUp.chain(tweenDown);
    tweenUp.start();
}
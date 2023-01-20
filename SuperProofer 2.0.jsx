/*
To all whom have the wherewithal and understanding to comprehend such magic....
This script was created by TYLER PRICE.
This project / script was not curated or paid for by FUSION IMAGING.
This script is free to use share and edit as desired.
The rights to this orginal code belong to TYLER PRICE.
Created in the year 2022

A humble servant of FUSION IMAGING created this script at home ON HIS OWN TIME to make your life easier....
Please be sure to show some respect and gratitude for the efforts excerted on your behalf...
*/

//Determine OS type

var osType = $.os.toLocaleLowerCase().indexOf("mac") >= 0 ? true : false;

//Establish GUI input defaults retention file save location

if (osType) {

  var defFile = File("~/Library/Application Support/Adobe/Adobe Illustrator 27/en_US/SuperProoferDefaults.txt");

}else {

  var defFile = File("~\\AppData\\Roaming\\Adobe\\Adobe Illustrator\\27.1.0\\SuperProoferDefaults.txt");

}

//Create array to read GUI defaults into

var guiDefaults = [];

/*
INPUT DEFAULTS FILE BREAKDOWN:
LN1: Script Version
LN2: Single sided if true, double sided if false
LN3: Export resolution value
LN4: Custom resolution if true, automatic resolution if false
LN5: Proof file name or appended text
LN6: Export all artboards if true, export selected artboard if false
LN7: Append text to arboard name if true, do not append text to arboard name if false
LN8: File save location
*/

//Read or create the UI defaults file, read values into the array

try {

  if(!defFile.exists) {

    //Create a defaults file if one does not already exist

    defFile.open("w");
    defFile.write("2\rtrue\r300\rfalse\rProofFile\rfalse\rfalse\r~/Desktop");
    defFile.close();
  
    defFile.open("r");

    while (!defFile.eof) {
  
      guiDefaults.push(defFile.readln());
  
    }

    defFile.close();
  
  }else {

    //Read in the defaults file
  
    defFile.open("r");

    while (!defFile.eof) {
  
      guiDefaults.push(defFile.readln());
  
    }

    defFile.close();

    //Check version number and update as necessary

    if(!(parseInt(guiDefaults[0]) == 2)) {

      guiDefaults = [];

      defFile.open("w");
      defFile.write("2\rtrue\r300\rfalse\rProofFile\rfalse\rfalse\r~/Desktop");
      defFile.close();
    
      defFile.open("r");

      while (!defFile.eof) {
    
        guiDefaults.push(defFile.readln());
    
      }

      defFile.close();

    }
  }

  //Make sure a document is open

  if(app.documents.length >= 1) {

    //Function call to init UI
  
    getInput();

  }else {

    alert("Please open a document.");

  }
}catch(e) {

  alert(e);

}

//Start and show UI

function getInput() {

  try {

    var gui = createGUI();
  
    gui.show();
  
  }catch(e) {
  
    alert(e);
  
  }
}

//Establishes the GUI

function createGUI() {

  //Proof type, single or double sided

  var typeState = (guiDefaults[1] === "true");

  //Resolution field state enabled or disabled

  var resState = (guiDefaults[3] === "true");

  //Export all artboards or current active artboard

  var exportState = (guiDefaults[5] === "true");

  //Append to artboard name or use just the artboard name

  var appendState = (guiDefaults[6] === "true");

  //Enclosing GUI window

  var gui = new Window("dialog", "Super Proofer 2.0");
  gui.alignChildren = "fill";
  gui.orientation = "column";

  //Proof Specifications panel

  var proofSpecifications = createGUIpanel(gui, "Proof Specifications");

  //Group for proof type selection

  var proofType = createGUIgroup(proofSpecifications, "row");
  proofType.margins.top = 10;

  //Single or double image proof selection radios

  proofType.selectSINGLE = proofType.add("radiobutton", [15,15,125,35], "Single Sided"); 
  proofType.selectDOUBLE = proofType.add("radiobutton", [15,15,205,35], "Double Sided / Commented");

  //Assign default state of proof type

  if(typeState) {

    proofType.selectSINGLE.value = true;
    proofType.selectDOUBLE.value = false;

  }else {

    proofType.selectSINGLE.value = false;
    proofType.selectDOUBLE.value = true;

  }

  //Group for resolution input

  var resGroup = createGUIgroup(proofSpecifications, "row");

  var customRes = createGUIgroup(resGroup, "row");

  //Proof resolution input field

  customRes.add("statictext", undefined, "Resolution:");
  customRes.margins.right = 20;

  var proofRes = customRes.add("edittext", [15,15,75,40]);
  
  proofRes.text = guiDefaults[2];

  //Read in defaults for manual / auto input

  if(resState) {

    customRes.enabled = true;

  }else {

    customRes.enabled = false;

    proofRes.text = getAutores(typeState, exportState);
    
  }

  //Buttons to change res between manual and automatic

  var modRes = createButton(resGroup, "Custom");

  var autoRes = createButton(resGroup, "Auto");

  //Panel for save options input

  var saveOptions = createGUIpanel(gui, "Save Options");
  saveOptions.alignChildren = "left";

  //Group for input of file name

  var namingGroup = createGUIgroup(saveOptions, "row");

  var customName = createGUIgroup(namingGroup, "column");
  customName.margins.top = 10;
  customName.alignChildren = "left";

  //Set the default label of the naming input field

  var nameString = appendState ? "Artboard Name Suffix" : "File Name";

  var nameType = customName.add("statictext", [15,15,250,28], nameString);

  var fileName = customName.add("edittext", [15,15,250,40]);

  //Set naming field default text

  fileName.text = guiDefaults[4];

  var nameSetting = createGUIgroup(namingGroup, "column");
  nameSetting.margins.top = 5;

  //Enable or disable appending text to the artboard name

  var boardAppend = nameSetting.add("checkbox", undefined, "Append Text");

  //Set default states for append text checkbox and naming field based on append default and export type default

  if(exportState) {

    customName.enabled = false;
    boardAppend.visible = true;

  }else {

    customName.enabled = true;

  }

  if(appendState) {

    boardAppend.visible = true;
    boardAppend.value = true;
    customName.enabled = true;

  }else {

    boardAppend.visible = exportState ? true : false;
    boardAppend.value = false;
    customName.enabled = exportState ? false : true;

  }

  //Button to enable and disable naming files based on Artboard name

  var exportToggle = createButton(nameSetting, "Artboard Names");

  //Single sided proof selection event handler

  proofType.selectSINGLE.onClick = function() {

    typeState = true;

    if(!resState) {

      proofRes.text = getAutores(typeState, exportState);

    }
  }

  //Double sided proof selection event handler

  proofType.selectDOUBLE.onClick = function() {

    typeState = false;

    if(!resState) {

      proofRes.text = getAutores(typeState, exportState);

    }
  }

  //Enable custom resolution

  modRes.onClick = function() {

    customRes.enabled = true;
    resState = true;

  }

  //Enable automatic resolution calculation

  autoRes.onClick = function() {

    customRes.enabled = false;
    resState = false;
    
    proofRes.text = getAutores(typeState, exportState);

  }

  //Toggle multi artboard export or single artboard export

  exportToggle.onClick = function() {

    if(exportState) {

      exportState = false;
      customName.enabled = true;
      boardAppend.visible = false;
      boardAppend.value = false;
      appendState = false;
      nameType.text = "File Name";

    }else {

      exportState = true;
      customName.enabled = false;
      boardAppend.visible = true;
      boardAppend.value = false;
      appendState = false;

    }

    //Updates autores value on click if needed

    if(app.activeDocument.artboards.length > 1 && !resState) {

      proofRes.text = getAutores(typeState, exportState);

    }
  }

  //Event handler for append text checkbox

  boardAppend.onClick = function() {

    if(!appendState) {

      appendState = true;
      nameType.text = "Artboard Name Suffix";
      customName.enabled = true;

    }else {

      appendState = false;
      nameType.text = "File Name";
      customName.enabled = false;

    }
  }

  saveOptions.add("statictext", [15,15,250,28], "Save Location");

  //Group for selection of file save location

  var saveLocation = createGUIgroup(saveOptions, "row");

  var folderPath = saveLocation.add("edittext", [15,15,250,40]);

  //Load default folder path

  folderPath.text = guiDefaults[7];

  //Temp var to store user selected platform specific folder path

  var saveFolder;

  //Button to select a save location

  var folderButton = createButton(saveLocation, "Choose Folder", function() {

    saveFolder = Folder.selectDialog("Select panel save location.");

    folderPath.text = saveFolder.fsName;

    folderPath.update();

  });

  //Group for bottom buttons

  var buttons = createGUIgroup(gui, "row");

  var confirmBtn = createButton(buttons, "Confirm", function() {

    gui.hide();

    //Prepare user input for use

    var exportRes = parseInt(proofRes.text);
    var saveName = fileName.text;
    var savePath = folderPath.text;

    //Write new defaults to defaults retention file

    defFile.open("w");
    defFile.write("2\r" + String(typeState) + "\r" + String(exportRes) + "\r" + String(resState) + "\r" + saveName + "\r" + String(exportState) + "\r" + String(appendState) + "\r" + savePath);
    defFile.close();

    //Call to begin exporting and creating proofs

    createProofs(typeState, exportRes, saveName, exportState, appendState, savePath);

    gui.close();

  });

  //Set the confirm button as the "Enter" button

  gui.defaultElement = confirmBtn;

  //Button to clear all fields of the UI

  var clearBtn = createButton(buttons, "Clear", function() {

    proofType.selectSINGLE.value = true;
    typeState = true;
    proofRes.text = "";
    customRes.enabled = true;
    resState = true;
    nameType.text = "File Name";
    fileName.text = "";
    customName.enabled = true;
    exportState = false;
    boardAppend.visible = false;
    boardAppend.value = false;
    appendState = false;
    folderPath.text = "";

    proofSpecifications.update();
    saveOptions.update();

  });

  //Close the GUI

  var cancelBtn = createButton(buttons, "Cancel", function() {

    gui.close();

  });

  //Set the cancel button as the "Escape" button

  gui.cancelElement = cancelBtn;

  return gui;

}

function createButton(parent, title, onClick) {

  //Create Button

  var button = parent.add("button", undefined, title);

  if(onClick !== undefined) button.onClick = onClick;

  //Return button

  return button;

}

function createGUIpanel(parent, title) {

  //Create Panel

  var panel = parent.add("panel", undefined, title);

  panel.orientation = "column";

  //Return panel

  return panel;

}

function createGUIgroup(parent, orientation) {

  //Create Group

  var group = parent.add("group");

  group.orientation = orientation;

  //Return Group

  return group;

}

//Performs automatic resolution calculations

function getAutores(typeState, multiExport) {

  try {

    //Get the active document

    var doc = app.activeDocument;
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    //Setting for algorithmic scaling of resolution

    var mScaler = typeState ? 5000 : 3000;
    var xShift = typeState ? 50 : 55;
    var yShift = typeState ? 1 : .15;

    /*
    Calculate either by the dims of just the first artboard or by an average of all the artboards
    Uses an algorithmic inverse function to determine the best resolution
    Settings can be adjusted above
    */

    if(doc.artboards.length == 1 || !multiExport) {

      //Get curently active artboard

      var boardIndex = doc.artboards.getActiveArtboardIndex();
      var selectedBoard = doc.artboards[boardIndex].artboardRect;

      //Get a size average width + height / 2

      var avgSize = ((selectedBoard[2]/72) + ((-selectedBoard[3])/72))/2;

      //Function is y=mx^-1, y axis is resolution x axis is artboard average size
  
      var setRes = mScaler * Math.pow((avgSize + yShift), -1) + xShift;
  
      return Math.round(setRes);

    }else {

      //Originally active artboard, ammount of artboards in the document, average calculation var

      var ogActive = doc.artboards.getActiveArtboardIndex();
      var boardNum = doc.artboards.length;
      var avgDim = 0;

      //loop through all the artboards in the document

      for (var i = 0; i < boardNum; i++) {

        doc.artboards.setActiveArtboardIndex(i);
        var currentBoard = doc.artboards[i].artboardRect;

        //Add the average size of each artboard to the avgDim variable

        var addSize = (((currentBoard[2]/72) + ((-currentBoard[3])/72))/2);

        avgDim = avgDim + addSize;

      }

      //Get a size average of all artboards from the average size of each artboard

      var avgSize = avgDim / doc.artboards.length;

      //Reset selected artboard back to the originally selected artboard

      doc.artboards.setActiveArtboardIndex(ogActive);

      //Function is y=mx^-1, y axis is resolution x axis is artboard average size

      var setRes = mScaler * Math.pow((avgSize + yShift), -1) + xShift;

      return Math.round(setRes);

    }
  }catch(e) {

    alert(e);

  }
}

function createProofs(proofSides, proofRes, saveName, exportType, appendText, savePath) {

  //Set values to vars needed for proof creation

  var doc = app.activeDocument;
  var boardIndex = doc.artboards.getActiveArtboardIndex();
  var pathDiv = $.os.toLowerCase().indexOf("mac") >= 0 ? "/" : "\\";
  var filePath;

  //Adjust persistent Export For Screens menu items

  app.preferences.setIntegerPreference("plugin/SmartExportUI/OpenLocationAfterExportPreference", 0);
  app.preferences.setIntegerPreference("plugin/SmartExportUI/CreateFoldersPreference", 0);
  app.preferences.setIntegerPreference("plugin/SmartExportUI/IncludeBleedInExport", 0);  

  //Establish some exportForScreens options

  var expOpts = new ExportForScreensOptionsJPEG();
  expOpts.compressionMethod = JPEGCompressionMethodType.BASELINESTANDARD;
  expOpts.AntiAliasing = AntiAliasingMethod.TYPEOPTIMIZED;
  expOpts.scaleType = ExportForScreensScaleType.SCALEBYRESOLUTION;
  expOpts.scaleTypeValue = proofRes;

  //Export just the active artboard or all of the artboards in the document (Exports all boards if exportType == true)

  if(!exportType) {

    //Retaining var for the original artboard name

    var ogArtboard = doc.artboards[boardIndex].name;

    //Set item to export as the first artboard and export the image

    var toExport = new ExportForScreensItemToExport();
    toExport.artboards = String(boardIndex+1);
    doc.artboards[boardIndex].name = saveName;

    doc.exportForScreens(Folder(savePath + pathDiv), ExportForScreensType.SE_JPEG100, expOpts, toExport);

    //Reset artboard name to original name, create filepath to be used by Photoshop

    doc.artboards[boardIndex].name = ogArtboard;
    filePath = savePath + pathDiv + saveName + ".jpg";

    //Calls the proof modification function based on what kind of proof it is going to be

    if(proofSides) {

      singleProof(filePath);

    }else {

      doubleProof(filePath);

    }

  }else {

    //Quantity of artboards in the active document

    var boardNum = doc.artboards.length;

    //Loop through all the artboards

    for(var i = 0; i < boardNum; i++) {

      //Exports each artboard

      var toExport = new ExportForScreensItemToExport();
      toExport.artboards = String(i+1);
      toExport.includeBleed = false;
      var ogArtboard = doc.artboards[i].name;

      //Adjust naming if text is to be appended to the arboard name

      if(appendText) {

        doc.artboards[i].name = doc.artboards[i].name + saveName;

      }

      doc.exportForScreens(Folder(savePath + pathDiv), ExportForScreensType.SE_JPEG100, expOpts, toExport);

      //Create a filepath for Photoshop to use
      
      filePath = savePath + pathDiv + doc.artboards[i].name + ".jpg";

      //Reset arboard back to its original name

      if(appendText) {

        doc.artboards[i].name = ogArtboard;

      }

      //Calls the proof modification function based on what kind of proof it is going to be

      if(proofSides) {

        singleProof(filePath);
  
      }else {
  
        doubleProof(filePath);
  
      }
    }
  }
}

function singleProof(filePath) {

  //Create new BridgeTalk object and target photoshop

  var bt = new BridgeTalk;

  bt.target = "photoshop";

  //Body of stringified extendscript code to send to photoshop

  bt.body = "var theFile = File('" + filePath + "');\
  app.displayDialogs = DialogModes.NO;\
  app.open(theFile);\
  var doc = app.activeDocument;\
  doc.changeMode(ChangeMode.CMYK);\
  app.preferences.rulerUnits = Units.PIXELS;\
  var largerSide = Number(doc.width) >= Number(doc.height) ? Number(doc.width) : Number(doc.height);\
  var scaleFactor = 2500 / largerSide;\
  doc.resizeImage(doc.width*scaleFactor, doc.height*scaleFactor, 150, ResampleMethod.AUTOMATIC);\
  var strokeColor = new SolidColor;\
  strokeColor.cmyk.cyan = 0;\
  strokeColor.cmyk.magenta = 0;\
  strokeColor.cmyk.yellow = 0;\
  strokeColor.cmyk.black = 100;\
  doc.selection.selectAll();\
  doc.selection.stroke(strokeColor, 1);\
  doc.selection.deselect();\
  app.preferences.rulerUnits = Units.INCHES;\
  var saveOpts = new JPEGSaveOptions;\
  saveOpts.quality = 12;\
  doc.saveAs(theFile, saveOpts, false, Extension.LOWERCASE);\
  doc.close(SaveOptions.DONOTSAVECHANGES);";

  bt.send();

  //Alerts of any errors encountered during the communication

  bt.onError = function(errorMsgObject) {

    alert(errorMsgObject);
    var err = bt.headers ["Error-Code"];
    alert(err);

  };
}

function doubleProof(filePath) {

  //Create new BridgeTalk object and target photoshop

  var bt = new BridgeTalk;

  bt.target = "photoshop";

  //Body of stringified extendscript code to send to photoshop

  bt.body = "var theFile = File('" + filePath + "');\
  app.displayDialogs = DialogModes.NO;\
  app.open(theFile);\
  var doc = app.activeDocument;\
  doc.changeMode(ChangeMode.CMYK);\
  app.preferences.rulerUnits = Units.PIXELS;\
  var largerSide = Number(doc.width) >= Number(doc.height) ? Number(doc.width) : Number(doc.height);\
  var scaleFactor = 1500 / largerSide;\
  doc.resizeImage(doc.width*scaleFactor, doc.height*scaleFactor, 75, ResampleMethod.AUTOMATIC);\
  var strokeColor = new SolidColor;\
  strokeColor.cmyk.cyan = 0;\
  strokeColor.cmyk.magenta = 0;\
  strokeColor.cmyk.yellow = 0;\
  strokeColor.cmyk.black = 100;\
  doc.selection.selectAll();\
  doc.selection.stroke(strokeColor, 1);\
  doc.selection.deselect();\
  app.preferences.rulerUnits = Units.INCHES;\
  var saveOpts = new JPEGSaveOptions;\
  saveOpts.quality = 12;\
  doc.saveAs(theFile, saveOpts, false, Extension.LOWERCASE);\
  doc.close(SaveOptions.DONOTSAVECHANGES);";

  bt.send();

  //Alerts of any errors encountered during the communication

  bt.onError = function(errorMsgObject) {

    alert(errorMsgObject);
    var err = bt.headers ["Error-Code"];
    alert(err);

  };
}
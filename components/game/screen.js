/**
 * canvas setting
 */
const topMargin = -30;
const leftMargin = 100;

/**
 * block UI setting
 */
const borderWidth = 5;
const blockSize = 25;
const widthBlockCount = 10;
const widthBlockPaddingCount = 3;
const heightBlockCount = 25;

/**
 * preview block setting
 */
const previewBlockLocationX = 450;
const previewBlockLocationY = 50;
const previewBlockRadius = 45;

class GameScreen {
  constructor() {
    this.canvas = document.getElementById("canvas");

    this.ctx = canvas.getContext("2d");

    this.stackedBlock = new StakedBlock();
    this.controlBlock = new ControlBlock();
    this.previewBlock = new PreviewBlock(
      previewBlockLocationX,
      previewBlockLocationY,
      previewBlockRadius
    );
    this.isSpaceDownRunning = false;
  }

  drawBlocks() {
    //logBlockArray(this.controlBlock.blockArray);
    this.drawTetrisBlocks();
    this.drawNextBlocks();
  }

  drawTetrisBlocks() {
    for (let x = 0; x < widthBlockCount; x++) {
      for (let y = 0; y < heightBlockCount; y++) {
        let stackedSingleBlock = this.stackedBlock.blockArray[x][y];
        if (stackedSingleBlock.isExist) {
          this.ctx.fillStyle = stackedSingleBlock.blockColor;
        } else {
          this.ctx.fillStyle = "#828282";
        }

        let controlSingleBlock = this.controlBlock.blockArray[x][y];
        if (controlSingleBlock.isExist) {
          this.ctx.fillStyle = controlSingleBlock.blockColor;
        }

        this.ctx.fillRect(
          borderWidth * x + blockSize * x + leftMargin,
          borderWidth * y + blockSize * y + topMargin,
          blockSize,
          blockSize
        );
      }
    }
  }

  drawNextBlocks() {
    this.previewBlock.setBlockType(this.controlBlock.blockType);
    this.previewBlock.draw(this.ctx);
    // let previewBlockCount = 4;
    // let previewBlockSize = 12;
    // let previewBorderWidth = 3;

    // let locationX = 400;
    // let locationY = 100;

    // let previewBlockRadius = 45;

    // this.ctx.fillStyle = "blue";
    // this.ctx.beginPath();
    // this.ctx.arc(
    //   locationX + previewBlockRadius,
    //   locationY + previewBlockRadius,
    //   previewBlockRadius,
    //   0,
    //   Math.PI * 2,
    //   false
    // );
    // this.ctx.fill();
    // this.ctx.fillStyle = "#828282";
    // for (let x = 0; x < previewBlockCount; x++) {
    //   for (let y = 0; y < previewBlockCount; y++) {
    //     this.ctx.fillRect(
    //       previewBorderWidth * x + previewBlockSize * x + locationX,
    //       previewBorderWidth * y + previewBlockSize * y + locationY,
    //       previewBlockSize,
    //       previewBlockSize
    //     );
    //   }
    // }
    //this.ctx.fillRect(locationX, locationY, previewBlockSize, previewBlockSize);
  }

  flowGravity() {
    let collisionCheckTmpArray = copyBlockArray(this.controlBlock.blockArray);
    if (
      couldBlockMoveToBottom(
        collisionCheckTmpArray,
        this.stackedBlock.blockArray
      )
    ) {
      moveToBottomOneLine(this.controlBlock.blockArray);
    } else {
      this.isSpaceDownRunning = false;
      this.addBlocksToStackedArray(
        this.controlBlock.blockArray,
        this.stackedBlock.blockArray
      );
      let removedLineCount = this.removeCompletedLine(0);
      addScore(removedLineCount);

      if (this.checkIsGameOver(this.stackedBlock.blockArray)) {
        this.controlBlock.removeControlBlock();
        gameOver();
      } else {
        this.controlBlock.addNewControlBlock();
        levelUp();
      }
    }

    this.reDraw();
  }

  removeCompletedLine(lineCount) {
    let stackedBlockArray = this.stackedBlock.blockArray;
    for (let y = 0; y < heightBlockCount; y++) {
      let isCompletedLine = true;
      for (let x = 0; x < widthBlockCount; x++) {
        if (!stackedBlockArray[x][y].isExist) {
          isCompletedLine = false;
          break;
        }
      }
      if (isCompletedLine) {
        this.removeLine(y);
        return this.removeCompletedLine(lineCount + 1);
      }
    }
    return lineCount;
  }

  removeLine(removeY) {
    let stackedBlockArray = this.stackedBlock.blockArray;
    for (let y = removeY; y > 0; y--) {
      for (let x = 0; x < widthBlockCount; x++) {
        copySingleBlock(stackedBlockArray[x][y], stackedBlockArray[x][y - 1]);
      }
    }
  }

  addBlocksToStackedArray(controlBlocks, stackedBlocks) {
    for (let x = 0; x < widthBlockCount; x++) {
      for (let y = 0; y < heightBlockCount; y++) {
        if (controlBlocks[x][y].isExist) {
          copySingleBlock(stackedBlocks[x][y], controlBlocks[x][y]);
        }
      }
    }
  }

  checkIsGameOver(stackedBlocks) {
    for (let x = 0; x < widthBlockCount; x++) {
      if (stackedBlocks[x][1].isExist) {
        return true;
      }
    }
    return false;
  }

  reDraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBlocks();
  }

  onEventLeftArrow() {
    if (
      couldBlockMoveToLeft(
        this.controlBlock.blockArray,
        this.stackedBlock.blockArray
      )
    ) {
      moveToLeftOneLine(this.controlBlock.blockArray);
    }
  }

  onEventRightArrow() {
    if (
      couldBlockMoveToRight(
        this.controlBlock.blockArray,
        this.stackedBlock.blockArray
      )
    ) {
      moveToRightOneLine(this.controlBlock.blockArray);
    }
  }

  onEventDownArrow() {
    this.flowGravity();
  }

  onEventUpArrow() {
    this.controlBlock.rotateBlock(
      this.controlBlock,
      this.controlBlock.blockArray,
      this.stackedBlock.blockArray,
      allowableRotationRange
    );
  }

  onEventSpace() {
    this.isSpaceDownRunning = true;
    while (this.isSpaceDownRunning) {
      this.flowGravity();
    }
  }
}

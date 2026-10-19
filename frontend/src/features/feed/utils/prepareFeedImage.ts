import {
  Platform,
} from 'react-native';

import {
  ImageManipulator,
  SaveFormat,
} from 'expo-image-manipulator';


const MAX_DIMENSION = 1200;

const TARGET_BYTES =
  500 * 1024;

const QUALITY_LEVELS = [
  0.78,
  0.68,
  0.58,
];


/* ======================================================
   TYPES
====================================================== */

export type PreparedFeedImage = {
  arrayBuffer: ArrayBuffer;

  contentType:
    'image/jpeg';

  extension:
    'jpg';

  sizeBytes:
    number;

  width:
    number;

  height:
    number;
};


type ImageDimensions = {
  width?: number;

  height?: number;
};


/* ======================================================
   PUBLIC FUNCTION
====================================================== */

export async function prepareFeedImage(
  uri: string,
  dimensions?: ImageDimensions
): Promise<PreparedFeedImage> {
  if (
    Platform.OS === 'web'
  ) {
    return prepareWebImage(
      uri
    );
  }

  return prepareNativeImage(
    uri,
    dimensions
  );
}


/* ======================================================
   SIZE CALCULATION
====================================================== */

function calculateTargetSize(
  originalWidth: number,
  originalHeight: number,
  maxDimension =
    MAX_DIMENSION
) {
  if (
    originalWidth <=
      maxDimension &&
    originalHeight <=
      maxDimension
  ) {
    return {
      width:
        Math.round(
          originalWidth
        ),

      height:
        Math.round(
          originalHeight
        ),
    };
  }

  const scale =
    maxDimension /
    Math.max(
      originalWidth,
      originalHeight
    );

  return {
    width:
      Math.round(
        originalWidth *
          scale
      ),

    height:
      Math.round(
        originalHeight *
          scale
      ),
  };
}


/* ======================================================
   NATIVE: iOS / Android
====================================================== */

async function prepareNativeImage(
  uri: string,
  dimensions?: ImageDimensions
): Promise<PreparedFeedImage> {
  let targetWidth:
    number | undefined;

  let targetHeight:
    number | undefined;


  if (
    dimensions?.width &&
    dimensions?.height
  ) {
    const target =
      calculateTargetSize(
        dimensions.width,
        dimensions.height
      );

    targetWidth =
      target.width;

    targetHeight =
      target.height;
  }


  const context =
    ImageManipulator.manipulate(
      uri
    );


  /*
   * Resize only when we know
   * the original dimensions.
   */
  if (
    targetWidth &&
    targetHeight
  ) {
    context.resize({
      width:
        targetWidth,

      height:
        targetHeight,
    });
  } else {
    /*
     * Fallback:
     * keep aspect ratio and limit width.
     *
     * ImagePicker normally gives us
     * width + height, so this should
     * rarely be used.
     */
    context.resize({
      width:
        MAX_DIMENSION,
    });
  }


  const rendered =
    await context.renderAsync();


  let smallestResult:
    PreparedFeedImage | null =
      null;


  for (
    const quality of
    QUALITY_LEVELS
  ) {
    const saved =
      await rendered.saveAsync({
        compress:
          quality,

        format:
          SaveFormat.JPEG,
      });


    const response =
      await fetch(
        saved.uri
      );

    const blob =
      await response.blob();

    const arrayBuffer =
      await blob.arrayBuffer();


    const prepared: PreparedFeedImage =
      {
        arrayBuffer,

        contentType:
          'image/jpeg',

        extension:
          'jpg',

        sizeBytes:
          blob.size,

        width:
          targetWidth ??
          MAX_DIMENSION,

        height:
          targetHeight ??
          0,
      };


    if (
      !smallestResult ||
      prepared.sizeBytes <
        smallestResult.sizeBytes
    ) {
      smallestResult =
        prepared;
    }


    /*
     * Good enough.
     * Stop recompressing.
     */
    if (
      blob.size <=
      TARGET_BYTES
    ) {
      return prepared;
    }
  }


  if (!smallestResult) {
    throw new Error(
      'Unable to prepare image.'
    );
  }


  return smallestResult;
}


/* ======================================================
   WEB
====================================================== */

async function prepareWebImage(
  uri: string
): Promise<PreparedFeedImage> {
  const response =
    await fetch(uri);

  const sourceBlob =
    await response.blob();


  const bitmap =
    await createImageBitmap(
      sourceBlob
    );


  try {
    const target =
      calculateTargetSize(
        bitmap.width,
        bitmap.height
      );


    const canvas =
      document.createElement(
        'canvas'
      );


    canvas.width =
      target.width;

    canvas.height =
      target.height;


    const context =
      canvas.getContext(
        '2d'
      );


    if (!context) {
      throw new Error(
        'Unable to prepare image.'
      );
    }


    /*
     * JPEG does not support transparency.
     * Fill transparent areas with white
     * instead of black.
     */
    context.fillStyle =
      '#FFFFFF';

    context.fillRect(
      0,
      0,
      target.width,
      target.height
    );


    context.drawImage(
      bitmap,
      0,
      0,
      target.width,
      target.height
    );


    let smallestBlob:
      Blob | null =
        null;


    for (
      const quality of
      QUALITY_LEVELS
    ) {
      const outputBlob =
        await canvasToJpegBlob(
          canvas,
          quality
        );


      if (
        !smallestBlob ||
        outputBlob.size <
          smallestBlob.size
      ) {
        smallestBlob =
          outputBlob;
      }


      if (
        outputBlob.size <=
        TARGET_BYTES
      ) {
        return {
          arrayBuffer:
            await outputBlob
              .arrayBuffer(),

          contentType:
            'image/jpeg',

          extension:
            'jpg',

          sizeBytes:
            outputBlob.size,

          width:
            target.width,

          height:
            target.height,
        };
      }
    }


    if (!smallestBlob) {
      throw new Error(
        'Unable to compress image.'
      );
    }


    return {
      arrayBuffer:
        await smallestBlob
          .arrayBuffer(),

      contentType:
        'image/jpeg',

      extension:
        'jpg',

      sizeBytes:
        smallestBlob.size,

      width:
        target.width,

      height:
        target.height,
    };
  } finally {
    bitmap.close();
  }
}


/* ======================================================
   WEB CANVAS → JPEG BLOB
====================================================== */

function canvasToJpegBlob(
  canvas:
    HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                'Unable to compress image.'
              )
            );

            return;
          }

          resolve(blob);
        },

        'image/jpeg',

        quality
      );
    }
  );
}
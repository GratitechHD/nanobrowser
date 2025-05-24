import { getTextExtractor } from 'office-text-extractor';

interface TextExtractionResult {
  text: string;
  error?: string;
}

/**
 * Extracts text from various file types including:
 * - Office documents (DOCX, PPTX, XLSX, PDF)
 * - Plain text files (TXT, JSON)
 */
export class TextExtractor {
  private officeExtractor = getTextExtractor();

  /**
   * Extracts text from a file based on its type
   * @param file The file to extract text from
   * @returns Promise resolving to the extracted text or error
   */
  async extractText(file: File): Promise<TextExtractionResult> {
    try {
      // Handle plain text files
      if (file.type === 'text/plain' || file.type === 'application/json') {
        return await this.extractPlainText(file);
      }

      // Handle office documents
      if (this.isOfficeDocument(file.type)) {
        return await this.extractOfficeDocument(file);
      }

      return {
        text: '',
        error: `Unsupported file type: ${file.type}`
      };
    } catch (error) {
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extracts text from plain text files (TXT, JSON)
   */
  private async extractPlainText(file: File): Promise<TextExtractionResult> {
    try {
      const text = await file.text();
      
      // If it's a JSON file, try to format it nicely
      if (file.type === 'application/json') {
        try {
          const jsonObj = JSON.parse(text);
          return {
            text: JSON.stringify(jsonObj, null, 2)
          };
        } catch {
          // If JSON parsing fails, return the raw text
          return { text };
        }
      }

      return { text };
    } catch (error) {
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Failed to read text file'
      };
    }
  }

  /**
   * Extracts text from office documents using office-text-extractor
   */
  private async extractOfficeDocument(file: File): Promise<TextExtractionResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const text = await this.officeExtractor.extractText({
        input: buffer,
        type: 'buffer'
      });

      return { text };
    } catch (error) {
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Failed to extract text from office document'
      };
    }
  }

  /**
   * Checks if the file type is a supported office document
   */
  private isOfficeDocument(mimeType: string): boolean {
    const supportedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
      'application/pdf' // PDF
    ];
    return supportedTypes.includes(mimeType);
  }
} 
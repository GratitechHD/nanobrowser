import { TextExtractor } from './textExtractor';

/**
 * Handles file processing and text extraction
 */
export class FileHandler {
  private textExtractor = new TextExtractor();

  /**
   * Process a file and extract its text content
   * @param file The file to process
   * @returns Promise resolving to the extracted text or error message
   */
  async processFile(file: File): Promise<string> {
    const result = await this.textExtractor.extractText(file);
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result.text;
  }

  /**
   * Process multiple files and extract their text content
   * @param files Array of files to process
   * @returns Promise resolving to an array of extracted texts
   */
  async processFiles(files: File[]): Promise<string[]> {
    const results = await Promise.all(
      files.map(file => this.processFile(file))
    );
    return results;
  }
} 
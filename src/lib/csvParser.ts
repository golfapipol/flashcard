import { CSVImportResult } from '../types/flashcard';

/**
 * CSV Parser utility for importing flashcard data
 */
export class CSVParser {
  /**
   * Parse CSV content and extract flashcard data
   */
  public static parseCSV(csvContent: string): CSVImportResult {
    try {
      // Normalize line endings and split into lines
      const lines = csvContent
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .filter(line => line.trim().length > 0);

      if (lines.length === 0) {
        return {
          success: false,
          error: 'The CSV file is empty. Please select a file with flashcard data.'
        };
      }

      const cards: { front: string; back: string }[] = [];
      let startIndex = 0;

      // Check if first row might be headers
      if (lines.length > 1) {
        const firstRow = this.parseCSVLine(lines[0]);
        const secondRow = this.parseCSVLine(lines[1]);
        
        // Simple heuristic: if first row has generic terms and second row has actual content
        if (firstRow.length >= 2 && secondRow.length >= 2) {
          const firstRowText = firstRow.join('').toLowerCase();
          const hasHeaderKeywords = /^(question|front|term|word|prompt|answer|back|definition|meaning)/.test(firstRowText);
          
          if (hasHeaderKeywords) {
            startIndex = 1; // Skip header row
          }
        }
      }

      // Parse data rows
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = this.parseCSVLine(line);
        
        if (columns.length < 2) {
          return {
            success: false,
            error: `Row ${i + 1} does not have enough columns. Each row must have at least 2 columns (front and back of card).`
          };
        }

        const front = columns[0]?.trim();
        const back = columns[1]?.trim();

        if (!front || !back) {
          return {
            success: false,
            error: `Row ${i + 1} has empty content. Both front and back of the card must have content.`
          };
        }

        cards.push({ front, back });
      }

      if (cards.length === 0) {
        return {
          success: false,
          error: 'No valid flashcard data found in the CSV file. Please ensure your file has at least one row with front and back content.'
        };
      }

      return {
        success: true,
        cards,
        rowCount: cards.length
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Parse a single CSV line, handling quoted fields and commas within quotes
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quoted field
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
        i++;
      } else {
        // Regular character
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  }

  /**
   * Validate file before parsing
   */
  public static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['text/csv', 'application/csv', 'text/plain'];
    const validExtensions = ['.csv', '.txt'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      return {
        valid: false,
        error: 'Please select a CSV file (.csv extension) or plain text file (.txt extension).'
      };
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File is too large. Please select a file smaller than 5MB.'
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        valid: false,
        error: 'The selected file is empty. Please choose a file with flashcard data.'
      };
    }

    return { valid: true };
  }

  /**
   * Read file content as text
   */
  public static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read the file. Please try again.'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Complete CSV import process: validate file, read content, and parse
   */
  public static async importFromFile(file: File): Promise<CSVImportResult> {
    // Validate file first
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    try {
      // Read file content
      const content = await this.readFileAsText(file);
      
      // Parse CSV content
      return this.parseCSV(content);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process the file'
      };
    }
  }
}
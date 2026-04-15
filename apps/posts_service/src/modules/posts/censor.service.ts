import { Injectable } from '@nestjs/common';

@Injectable()
export class CensorService {
  private readonly blacklist = [
    // Vietnamese sensitive words (examples)
    'phản động', 'biểu tình', 'lật đổ', 'chế độ', 'kích động',
    'xấu xa', 'ngu ngốc', 'đanh đá', 'vô giáo dục',
    // English sensitive words (examples)
    'fuck', 'shit', 'idiot', 'scam', 'violence', 'terrorist',
  ];

  /**
   * Checks if the content contains any blacklisted words.
   * @param content The text to check
   * @returns An object highlighting if sensitive words were found and what they are.
   */
  checkContent(content: string): { isSafe: boolean; flaggedWords: string[] } {
    if (!content) return { isSafe: true, flaggedWords: [] };

    const lowerContent = content.toLowerCase();
    const flaggedWords = this.blacklist.filter((word) =>
      lowerContent.includes(word.toLowerCase()),
    );

    return {
      isSafe: flaggedWords.length === 0,
      flaggedWords,
    };
  }

  /**
   * Automatically masks sensitive words in the content.
   * @param content The text to filter
   * @returns Filtered text with sensitive words replaced by asterisks.
   */
  filterContent(content: string): string {
    if (!content) return content;

    let filteredContent = content;
    this.blacklist.forEach((word) => {
      const regex = new RegExp(word, 'gi');
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
    });

    return filteredContent;
  }
}

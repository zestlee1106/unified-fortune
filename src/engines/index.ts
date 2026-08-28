import type { BirthInput, Reading } from '../core/types'
import { sajuEngine } from './saju'
import { zodiacAnimalEngine } from './zodiacAnimal'
import { westernEngine } from './western'
import { thaiDayEngine } from './thaiDay'
import { numerologyEngine } from './numerology'
import { mayaEngine } from './maya'
import { birthstoneEngine } from './birthstone'
import { mbtiEngine } from './mbti'
import { bloodZodiacEngine } from './bloodZodiac'

/**
 * 결과 화면에 나오는 순서.
 * 오늘의 운세와 대운은 성격이 달라서 여기 안 들어가고 별도 섹션으로 나간다.
 */
export function runAll(input: BirthInput): Reading[] {
  return [
    sajuEngine(input),
    zodiacAnimalEngine(input),
    westernEngine(input),
    thaiDayEngine(input),
    numerologyEngine(input),
    mayaEngine(input),
    mbtiEngine(input),
    bloodZodiacEngine(input),
    birthstoneEngine(input),
  ]
}

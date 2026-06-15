package protocol

import "time"

// BetweenFe4eGap is a brief pause between back-to-back queue commits in one session.
func BetweenFe4eGap() time.Duration { return postFe4eChainGap }

// PostCommitReadDelay is the gap before EEPROM read-back polls after FE4E.
func PostCommitReadDelay() time.Duration { return postCommitReadDelay }

// CommitReadRetries polls after checksum FE4E if the first read mismatches.
func CommitReadRetries() int { return commitReadRetries }

// DataCommitReadRetries polls after a data-byte FE4E if the first read mismatches.
func DataCommitReadRetries() int { return dataCommitReadRetries }

// PostDataReadDelay is the gap between data-byte read-back polls.
func PostDataReadDelay() time.Duration { return postDataReadDelay }

// PostEepromReadSettle is a brief wait after host EEPROM reads (Dump).
func PostEepromReadSettle() time.Duration { return postEepromReadSettle }

// ReadEepromVerifyTO is the EEPROM collect timeout for single-byte verify reads.
func ReadEepromVerifyTO() time.Duration { return readEepromVerifyTO }

const (
	EepromSize          = 512
	ChecksumAddr        = 0x17F
	ChecksumRegionBytes = 384
	ChecksumDataEnd     = 0x17F
	EepromChunk         = 32
	ReadMemoryRetries   = 3
	SpaceRAM            = 0x00
	SpaceEEPROM         = 0x01
	CamAddrF90X         = 0x20
	RAMQueueBuf         = 0xFC70
	Fe4eSaveReg         = 0xFE4E
	Fe4eSaveVal         = 0x14
	QueueBit            = 0x20
	PingRAMAddr         = 0xFD40
	BaudSlow            = 1200
	BaudFast            = 9600
)

var (
	WakeupByte    = []byte{0x00}
	SigninCmd     = []byte{0x53, 0x31, 0x30, 0x30, 0x30, 0x05}
	EOT           = []byte{0x04, 0x04}
	WakeupAwakeNAK  = []byte{0x15, 0x83}
	BaudUpgradeF90X = []byte{0x01, 0x20, 0x87, 0x05, 0x00, 0x00, 0x00, 0x00, 0x03}
)

const (
	wakeupDelay     = 300 * time.Millisecond
	baudSwitchDelay = 200 * time.Millisecond
	fastLinkSettle  = 350 * time.Millisecond
	readPostDelay   = 100 * time.Millisecond
	readCollectTO   = 2 * time.Second
	readEepromCollect = 6 * time.Second

	// @2156 deferred queue + @06DB FEB5.5: one wait, both .5 bits clear (Python/C# model).
	queueTimeout    = 10 * time.Second
	queuePollGap    = 120 * time.Millisecond
	fe4eSaveDelay   = 1 * time.Second
	postFe4eChainGap = 500 * time.Millisecond

	postEepromReadSettle  = 400 * time.Millisecond
	readEepromVerifyTO    = 3 * time.Second
	postCommitReadDelay   = 500 * time.Millisecond
	commitReadRetries     = 2
	postDataReadDelay     = 500 * time.Millisecond
	dataCommitReadRetries = 2

	ramWriteAckRetries  = 2
	ramWriteAckRetryGap = 80 * time.Millisecond
	postRelinkSettle    = 300 * time.Millisecond
	ioReadTimeout       = 8 * time.Millisecond
)

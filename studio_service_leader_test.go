package main

import "testing"

func TestLeaderDragMapping(t *testing.T) {
	svc := &StudioService{}

	if got := svc.LeaderDragToValue(1); got != 6 {
		t.Fatalf("LeaderDragToValue(1) = %d, want 6", got)
	}
	if got := svc.LeaderDragToValue(0); got != 31 {
		t.Fatalf("LeaderDragToValue(0) = %d, want 31", got)
	}
	if got := svc.LeaderDragToValue(0.5); got != 19 {
		t.Fatalf("LeaderDragToValue(0.5) = %d, want 19", got)
	}

	if got := svc.LeaderValueToDrag(6); got != 1 {
		t.Fatalf("LeaderValueToDrag(6) = %v, want 1", got)
	}
	if got := svc.LeaderValueToDrag(31); got != 0 {
		t.Fatalf("LeaderValueToDrag(31) = %v, want 0", got)
	}
}

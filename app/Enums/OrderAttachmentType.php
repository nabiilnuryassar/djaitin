<?php

namespace App\Enums;

enum OrderAttachmentType: string
{
    case Reference = 'reference';
    case DesignProposal = 'design_proposal';
    case Revision = 'revision';
    case FinalArtwork = 'final_artwork';
    case Other = 'other';
}
